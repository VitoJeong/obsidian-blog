import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "./styles/recentNotesForIndex.scss"

interface Options {
  title?: string
  limit: number
  showTags: boolean
}

const defaultOptions: Options = {
  limit: 5,
  showTags: true,
}

export default ((userOpts?: Partial<Options>) => {
  const RecentNotesForIndex: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    if (fileData.slug !== "index") return null

    const pages = allFiles
      .filter((f) => f.slug !== "index")
      .sort(byDateAndAlphabetical(cfg))
      .slice(0, opts.limit)

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h3>{opts.title ?? i18n(cfg.locale).components.recentNotes.title}</h3>
        <ul class="recent-ul">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const tags = page.frontmatter?.tags ?? []

            return (
              <li class="recent-li">
                <div class="recent-header">
                  <div class="recent-title">
                    <h3>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {title}
                      </a>
                    </h3>
                  </div>
                  {page.dates && (
                    <div class="recent-date">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </div>
                  )}
                </div>
                <div class="section">
                  {opts.showTags && tags.length > 0 && (
                    <ul class="tags">
                      {tags.map((tag) => (
                        <li>
                          <a
                            class="internal tag-link"
                            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                          >
                            {tag}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  RecentNotesForIndex.css = style
  return RecentNotesForIndex
}) satisfies QuartzComponentConstructor
