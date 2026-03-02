import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import RecentNotes from "./RecentNotes"

export default ((userOpts?: any) => {
  const RecentNotesComponent = RecentNotes({
    limit: 5,
    showTags: true,
    linkToMore: "all-posts" as any,
    filter: (f) => f.slug !== "index",
    ...userOpts,
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
}) satisfies QuartzComponentConstructor
