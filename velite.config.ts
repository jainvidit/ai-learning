import { defineConfig, s } from 'velite'
import { basename, dirname } from 'node:path'

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: {
    lessons: {
      name: 'Lesson',
      pattern: 'modules/**/lessons/**/lesson.mdx',
      schema: s
        .object({
          id: s.string(),
          title: s.string(),
          minutes: s.number(),
          objectives: s.array(s.string()),
          code: s.mdx(),
          // Derive moduleId and lessonId from file path
          moduleId: s.string(),
          lessonId: s.string(),
        })
        .transform((data, { meta }) => {
          // Extract moduleId and lessonId from file path
          // Path format: modules/{moduleId}/lessons/{lessonId}/lesson.mdx
          const pathParts = meta.path.split('/')
          const moduleIndex = pathParts.indexOf('modules')
          const lessonsIndex = pathParts.indexOf('lessons')

          return {
            ...data,
            moduleId: pathParts[moduleIndex + 1],
            lessonId: pathParts[lessonsIndex + 1],
          }
        })
    }
  },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: []
  }
})
