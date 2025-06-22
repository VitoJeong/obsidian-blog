---
title: JAZZYBYTE
Description: 백엔드 개발자 Vito의 기술 블로그
---
# 👋 Welcome to JazzyByte

`JazzyByte`는 **재즈를 좋아하는 백엔드 개발자 Vito**의 기술 블로그입니다.  
공부한 내용, 사고의 흐름,  문제 해결 과정 등을 기록합니다.

재즈를 좋아하는 이유는, 자유롭게 연주하면서도 전체적으로 조화를 이루는 그 느낌이 좋아서예요.  
각자 제멋대로 치는 것 같은데, 들을때는 하나로 어우러지고 아름답거든요.

개발도 비슷하다고 생각해요.  
기술을 바탕으로 문제를 해결하는 방식은 사람마다 다르고, 그 안에 자기만의 스타일이 녹아들잖아요.
여기서 편하게 생각을 얘기해보고,  저만의 문제 해결 방식을 쌓아가려고 해요.


## Recently update

```dataviewjs
const pages = dv.pages('"Publish/Articles"')
  .sort(p => p.file.mtime, 'desc')
  .limit(10);

dv.table(["제목", "최종 수정일"], 
  pages.map(p => [p.file.link, p.file.mtime.toFormat("yyyy-MM-dd")])
);
```
## 최근 게시물
---
title: JAZZYBYTE
Description: 백엔드 개발자 Vito의 기술 블로그
---
# 👋 Welcome to JazzyByte

`JazzyByte`는 **재즈를 좋아하는 백엔드 개발자 Vito**의 기술 블로그입니다.  
공부한 내용, 사고의 흐름,  문제 해결 과정 등을 기록합니다.

재즈를 좋아하는 이유는, 자유롭게 연주하면서도 전체적으로 조화를 이루는 그 느낌이 좋아서예요.  
각자 제멋대로 치는 것 같은데, 들을때는 하나로 어우러지고 아름답거든요.

개발도 비슷하다고 생각해요.  
기술을 바탕으로 문제를 해결하는 방식은 사람마다 다르고, 그 안에 자기만의 스타일이 녹아들잖아요.
여기서 편하게 생각을 얘기해보고,  저만의 문제 해결 방식을 쌓아가려고 해요.


## Recently update

```dataviewjs
const pages = dv.pages('"Publish/Articles"')
  .sort(p => p.file.mtime, 'desc')
  .limit(10);

dv.table(["제목", "최종 수정일"], 
  pages.map(p => [p.file.link, p.file.mtime.toFormat("yyyy-MM-dd")])
);
```
```dataview
table file.link as 제목, file.mtime as "최종 수정일"
from "Publish/Articles"
sort file.mtime desc
limit 10
```

