<template>
    <v-app class="indigo lighten-5">>
      <stj-header></stj-header>

      <v-content>
          <router-view></router-view>
      </v-content>
  </v-app>
</template>

<script>
import stjHeader from './components/toolbarHeader'

export default {
    name: 'App',
    components: {
        stjHeader
    },
    data: () => ({
    //
    })
}
</script>
