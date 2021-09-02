<template>
  <LayoutWrap>
    <Home v-if="$page.frontmatter.home" />
    <Page v-else :sidebar-items="sidebarItems">
      <template #top>
        <slot name="page-top" />
      </template>
      <template #bottom>
        <slot name="page-bottom" />
      </template>
    </Page>
  </LayoutWrap>
</template>

<script>
import LayoutWrap from '@theme/components/LayoutWrap.vue'
import Home from '@theme/components/Home.vue'
import Page from '@theme/components/Page.vue'
import { resolveSidebarItems } from '@parent-theme/util'

export default {
  name: 'Layout',

  components: {
    LayoutWrap,
    Home,
    Page
  },

  computed: {
    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    }
  }
}
</script>
