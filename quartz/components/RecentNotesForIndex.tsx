import { QuartzComponent, QuartzComponentProps } from "./types"
import RecentNotes from "./RecentNotes"

const RecentNotesForIndex: QuartzComponent = (props: QuartzComponentProps) => {
  if (props.fileData.slug === "index") {
    return RecentNotes({
      title: "Recent Posts",
      limit: 10,
      showTags: true,
      linkToMore: false,
      filter: (f) => f.slug !== "index",
    })(props)
  }
  return null
}

// Ensure styles from the inner RecentNotes component are included
RecentNotesForIndex.css = RecentNotes({}).css

export default RecentNotesForIndex
