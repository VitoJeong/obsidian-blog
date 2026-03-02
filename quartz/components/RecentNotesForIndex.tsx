import { QuartzComponent, QuartzComponentProps } from "./types"
import RecentNotes from "./RecentNotes"

export default (() => {
  const RecentNotesComponent = RecentNotes({
    limit: 5,
    showTags: true,
    linkToMore: "all-posts" as any, // "all-posts" 페이지가 있을 경우
    filter: (f) => f.slug !== "index", // 자기 자신은 제외
  })

  const RecentNotesForIndex: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData } = props
    if (fileData.slug === "index") {
      return <RecentNotesComponent {...props} />
    }
    return null
  }

  RecentNotesForIndex.css = RecentNotesComponent.css
  return RecentNotesForIndex
})
