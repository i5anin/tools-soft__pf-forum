<template>
  <v-list density="compact" :nav="true" class="test">
    <template v-for="(item, index) in menuItems" :key="index">
      <v-list-item
        v-if="!item.items"
        :prepend-icon="getIcon(item.icon)"
        :title="item.title"
        @click="onNavigate(item.path)"
      >
      </v-list-item>
      <v-list-group v-else>
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="getIcon(item.icon)"
            :title="item.title"
          >
          </v-list-item>
        </template>
        <sidebar-menu-item
          v-for="(subItem, subIndex) in item.items"
          :key="subIndex"
          :item="subItem"
        >
        </sidebar-menu-item>
      </v-list-group>
    </template>
  </v-list>
</template>

<script>
import SidebarMenuItem from '@/main-app/SidebarMenuItem.vue'

export default {
  components: { SidebarMenuItem },
  props: {
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    onNavigate(path) {
      this.$router.push(path)
    },
    getIcon(icon) {
      return icon || 'mdi-circle-outline'
    },
  },
}
</script>
