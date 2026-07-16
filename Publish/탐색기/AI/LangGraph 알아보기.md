---

title: "LangGraph 알아보기"

lastmod: 2026-05-12

tags:

- AI

- LLM

- LangGraph

- LangChain

---
작년부터 LangChain, LangGraph라는 용어를 간간이 듣게 됐다. AI 관련 프로그램에 관심이 있다면 한 번쯤 들어봤을 기술이다. 둘 다 AI 애플리케이션을 개발하기 위한 프레임워크이고, 오픈소스로 공개돼 있다.

마침 이 기술을 써서 개발할 일이 생겼다. 본격적으로 손대기 전에, **왜 필요한지**와 **어떻게 구성돼 있는지** 알아보려 한다.

---

## 1. AI 프레임워크란?

먼저 "왜 필요한지"부터. LLM을 사용하여 애플리케이션을 개발하다 보면 "프롬프트 한 번 호출"만으로 끝나는 일은 거의 없다. 질문을 분류하고, SQL이나 Open API 같은 도구도 사용하게 되고, 그 결과가 부실하면 다시 시도하고… 이런 단계를 직접 구현하면 금세 복잡해지고 관리하기 어려워진다. 게다가 어떤 LLM 애플리케이션이든 아래 같은 작업이 공통으로 반복된다.

- 모델 호출 추상화 (모델을 바꿔도 코드가 안 흔들리게)
- 프롬프트 관리와 출력 파싱
- 적절한 도구(함수) 탐색 및 연결
- 여러 단계의 조합
- 단계 사이의 상태 전달, 스트리밍, 로깅

**AI 프레임워크**는 이렇게 반복되는 공통 작업을 대신 맡아, 개발자가 "무엇을 할지"에 집중하게 해준다. 대표적으로 LangChain 생태계(LangChain, LangGraph)와 LlamaIndex 등이 있고, 이 글에서는 그중 흐름 제어에 특화된 **LangGraph**를 살펴본다.

---

## 2. LangChain 과 비교

LangGraph를 이해하려면 형제 격인 **LangChain**을 먼저 보는 게 빠르다.

**LangChain**은 구성요소(모델, 프롬프트, 파서, 도구, 리트리버)를 **LCEL (LangChain Expression Language)** 로 파이프처럼 연결한다. 예를 들어 "국가 → 대표 도시 → 도시별 랜드마크"를 뽑는 2단계 체인은 이렇게 쓴다.

```python
# 구조화 출력 스키마
class Cities(BaseModel):
    cities: list[str]

class CityLandmarks(BaseModel):
    city: str
    landmarks: list[str]

class Result(BaseModel):
    places: list[CityLandmarks]

# 1단계) 국가 → 대표 도시
find_cities = (
    ChatPromptTemplate.from_template("{country}의 대표 도시 3곳을 알려줘")
    | model.with_structured_output(Cities)
)

# 2단계) 도시들 → 도시별 랜드마크(구조화 출력)
find_landmarks = (
    ChatPromptTemplate.from_template("다음 도시들의 대표 랜드마크를 정리해줘: {cities}")
    | model.with_structured_output(Result)
)

# 두 단계를 파이프로 이어 붙인다 (1단계 출력 → 2단계 입력)
chain = find_cities | (lambda out: {"cities": out.cities}) | find_landmarks

chain.invoke({"country": "일본"})
```

`국가 → 도시 → 랜드마크`처럼 한 방향으로 흐르는 **선형(혹은 DAG) 파이프라인**에 강하다. 조립이 빠르고 직관적이다.

구현이 쉽고 빠른 만큼 한계도 존재한다. LangChain의 체인은 기본적으로 **한 방향으로만 진행되기 때문에** 분기나 재시도 같은 복잡한 흐름을 구현하기 어렵다. 그런데 대부분 LLM을 사용하는 애플리케이션에서는 이런 게 필요하다.

- 조건에 따라 **분기**하고, 부실하면 앞 단계로 **되돌아가는(순환)** 흐름
- 여러 단계가 **하나의 상태를 공유하며** 상태에 따라 처리 과정과 결과가 달라짐
- 중간에 멈춰 사람의 확인을 받고 **다시 이어가기**

이걸 체인으로 표현하면 억지스러워진다. 억지로 구현했다 하더라도 변경이 필요하거나 확장이 필요해지면 난이도와 변경의 여파는 급격히 올라가게 될 것이다. **LangGraph**는 바로 이 부분을 해결하기 위해 나왔다. 흐름을 **그래프(노드 + 엣지)**로 명시하고, 순환/분기/공유 상태/영속성을 1급으로 다룬다. 그러면서도 LangChain의 구성요소(모델, 도구)를 노드 안에서 그대로 쓸 수 있다.

| |LangChain (LCEL)|LangGraph|
|---|---|---|
|모델|체인(파이프)|그래프(노드 + 엣지)|
|흐름|선형 / DAG|분기 / 순환 허용|
|상태|단계 간 전달|그래프 전역 공유 상태|
|강점|빠른 조립, 단순 파이프라인|복잡한 제어, 루프, 멀티스텝|

> [!tip] 한 줄 정리 **단순히 이어 붙이면 LangChain, 흐름을 제어해야 하면 LangGraph.** 둘은 경쟁이 아니라 층위가 다르다 — LangGraph 노드 _안에서_ LangChain을 쓴다.

---

## 3. LangGraph 주요 컴포넌트

LangGraph의 핵심은 네 가지다: **상태 / 노드 / 엣지 / 컴파일**.

### State (상태)

그래프 전체가 공유하는 **타입이 정의된 상태**다. 보통 `TypedDict`로 선언한다.

```python
from typing import TypedDict

# 그래프 전체가 공유하는 상태 — 각 노드가 이 값을 읽고 갱신한다
class State(TypedDict):
    question: str
    answer: str
```

노드는 상태를 통째로 바꾸지 않고 **바뀐 부분만 dict로 반환**한다. 이를 합치는 건 LangGraph의 몫이다. 기본은 덮어쓰기지만, `Annotated`로 **reducer**를 지정하면 병합 방식을 바꿀 수 있다(예: 메시지 목록은 덮어쓰지 않고 이어붙이는 `add_messages`).

### Node (노드)

`상태 → 부분 상태`를 반환하는 함수다. 여기서 LLM 호출, 도구 실행 같은 **핵심적인 작업**이 처리된다.

```python
# 노드는 상태를 받아 "바뀐 부분만" dict로 반환한다
def answer_node(state: State) -> dict:
    # 실제로는 여기서 LLM 을 호출한다
    return {"answer": f"'{state['question']}' 에 대한 답변"}
```

### Edge (엣지)

노드를 잇는 선이다. 두 종류가 있다.

- **일반 엣지** `add_edge("a", "b")` — a 다음엔 무조건 b
- **조건부 엣지** `add_conditional_edges("a", route_fn)` — `route_fn`이 상태를 읽고 **다음 노드 이름을 반환**한다. 분기와 순환의 핵심이다.

시작과 끝은 특수 노드 `START`, `END`로 표시한다.

```python
from langgraph.graph import StateGraph, START, END

# 노드와 엣지를 등록해 그래프를 조립하고, compile()로 실행 객체를 만든다
g = StateGraph(State)
g.add_node("answer", answer_node)
g.add_edge(START, "answer")
g.add_edge("answer", END)

app = g.compile()
app.invoke({"question": "안녕?"})
```

### Compile & Run + 영속성

`compile()`하면 실행 가능한 객체가 나온다. `invoke`로 한 번에 받거나, `stream` / `astream`으로 토큰/이벤트를 흘려받을 수 있다(중간 과정을 출력할 수 있다).

여기에 **checkpointer**를 붙이면 상태가 저장돼, 멀티턴 대화 메모리, 사람 개입(중단→승인→재개), 과거 시점으로 되감기까지 가능해진다. 대화 단위는 `thread_id`로 구분한다.

> [!note] 실행 모델 LangGraph는 한 스텝(super-step)마다 활성 노드들을 실행하고 상태를 병합하는 방식으로 돈다. 순환 구조라도 `recursion_limit`으로 스텝 수에 상한을 둬 무한 루프를 막는다.

---

## 4. LangGraph 설계 패턴

컴포넌트를 조합하면 몇 가지 익숙한 그래프 모양이 나온다.

- **순차(체인)**: `A → B → C`. 단계별로 프롬프트를 잇는 가장 단순한 형태.
- **분기(라우팅)**: 입력을 분류해 서로 다른 경로로 보낸다. 조건부 엣지가 담당.
- **병렬(팬아웃 → 팬인)**: 여러 노드를 동시에 돌리고 결과를 리듀서로 합친다.
- **순환(루프)**: 결과가 부족하면 앞 노드로 되돌아가 다시 시도한다. 재시도, 자기 교정 루프가 여기 속한다.
- **사람 개입(human-in-the-loop)**: 중간에 멈춰 사람의 승인을 받고 이어간다. 체크포인터가 있어야 가능하다.

분기와 순환을 함께 쓰면 이런 그래프가 된다.

핵심은 **"다음에 어디로 갈지"를 상태를 읽는 함수로 표현**한다는 점이다. 분기 조건도, 루프 종료 조건도 모두 코드로 명시된다. 덕분에 흐름을 그림처럼 추적하고 테스트할 수 있다.

---

## 5. 결론

LangGraph는 한마디로 **LLM 호출을 그래프로 엮는 오케스트레이션 도구**다.

- 상태를 여러 단계가 공유하고,
- 조건에 따라 분기하거나 되돌아가고,
- 대화를 이어가거나 사람이 개입해야 할 때

빛난다. 반대로 흐름이 단순한 선형 파이프라인이라면 LangChain(LCEL)만으로 충분하다. **복잡한 제어가 필요해지는 순간이 LangGraph를 꺼낼 때다.**

컴포넌트와 패턴을 훑었으니, 다음은 이걸로 실제 서비스를 어떻게 설계하는지다. 그건 직접 만들어보며 이어서 정리해보려 한다.