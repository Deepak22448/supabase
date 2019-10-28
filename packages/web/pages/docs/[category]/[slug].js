import { useRouter } from 'next/router'
import Layout from '~/components/layouts/DocsLayout'
import Loading from '~/components/Loading'
import Link from 'next/link'
import PropTypes from 'prop-types'

const importReducer = ctx => {
  let keys = ctx.keys()
  let values = keys.map(ctx)
  return keys.reduce((o, k, i) => {
    o[k] = values[i]
    return o
  }, {})
}

// Import all docs
var Docs = []
Docs['-'] = importReducer(require.context('../../../content/docs/-', true, /.mdx$/))
Docs['packaged'] = importReducer(require.context('../../../content/docs/packaged', true, /.mdx$/))
Docs['admin-api'] = importReducer(require.context('../../../content/docs/admin-api', true, /.mdx$/))
Docs['realtime'] = importReducer(require.context('../../../content/docs/realtime', true, /.mdx$/))
Docs['restful'] = importReducer(require.context('../../../content/docs/restful', true, /.mdx$/))
Docs['graphql'] = importReducer(require.context('../../../content/docs/graphql', true, /.mdx$/))
Docs['baseless'] = importReducer(require.context('../../../content/docs/baseless', true, /.mdx$/))

// Set up all sidebars
var Sidebars = []
Sidebars['-'] = {
  introduction: ['about', 'contributing'],
}
Sidebars['packaged'] = {
  introduction: ['getting-started'],
}
Sidebars['admin-api'] = {
  introduction: ['getting-started'],
  API: ['schemas', 'tables'],
}
Sidebars['realtime'] = {
  introduction: ['getting-started', 'installation'],
  'Client libraries': ['realtime-js'],
}
Sidebars['restful'] = {
  introduction: ['getting-started'],
}
Sidebars['graphql'] = {
  introduction: ['getting-started'],
}
Sidebars['baseless'] = {
  introduction: ['getting-started'],
}

const CategoryDocs = props => {
  const router = useRouter()
  let { category, slug } = router.query
  if (!category || !slug) return <Loading />

  const categoryDocs = Docs[category]
  const categorySidebar = enrichSidebar(Sidebars[category], categoryDocs)
  const documentation = categoryDocs[`./${slug}.mdx`]
  const Content = documentation.default
  const { metadata } = documentation
  const { title, description } = metadata
  const pages = Object.values(Sidebars[category]) // array of arrays
  const pageArray = pages.concat.apply([], pages) // flatten
  const sidebarIndex = pageArray.indexOf(slug)
  const nextDocSlug = pageArray[sidebarIndex + 1]
  const nextDoc = nextDocSlug ? categoryDocs[`./${nextDocSlug}.mdx`] : null
  const previousDocSlug = pageArray[sidebarIndex - 1]
  const previousDoc = previousDocSlug ? categoryDocs[`./${previousDocSlug}.mdx`] : null

  return (
    <Layout sidebar={categorySidebar} activeCategory={category}>
      <div className="has-background-dark">
        <div className="content w-m-800 p-md p-t-xl p-b-xl m-b-lg">
          <h1 className="title">{title}</h1>
          <p className="subtitle">{description}</p>
        </div>
      </div>
      <div className="content w-m-800 p-md">
        <Content />
      </div>
      <div className="w-m-800 p-md p-b-lg">
        <nav className="columns reverse-row-order">
          <div className="column ">
            {!!nextDoc && (
              <Link href={`/docs/[category]/[slug]`} as={`/docs/${category}/${nextDocSlug}`}>
                <a className="box p-md has-text-right">
                  <p className="heading has-text-grey">Next</p>
                  <p>{nextDoc.metadata.sidebarLabel || nextDoc.metadata.title}</p>
                </a>
              </Link>
            )}
          </div>
          <div className="column is-hidden-mobile "></div>
          <div className="column">
            {!!previousDoc && (
              <Link href={`/docs/[category]/[slug]`} as={`/docs/${category}/${previousDocSlug}`}>
                <a className="box p-md has-text-right">
                  <p className="heading has-text-grey">Previous</p>
                  <p>{previousDoc.metadata.sidebarLabel || previousDoc.metadata.title}</p>
                </a>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </Layout>
  )
}

export default CategoryDocs

/**
 * Fills the sidebar array with relevant metadata,
 */
const enrichSidebar = (sidebar, categoryDocs) => {
  return Object.keys(sidebar).reduce((acc, heading) => {
    acc[heading] = sidebar[heading].map(slug => {
      const documentation = categoryDocs[`./${slug}.mdx`]
      const { metadata } = documentation
      const { title, sidebarLabel } = metadata
      return { slug, title: sidebarLabel || title }
    })
    return acc
  }, {})
}
