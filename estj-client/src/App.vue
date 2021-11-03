<template>
    <v-app class="indigo lighten-5">>
        <stj-header></stj-header>

        <v-main>
            <transition name="fade" mode="out-in" >
                <router-view></router-view>
            </transition>
        </v-main>
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

<style>
    .fade-enter {
        opacity: 0;
    }
    .fade-enter-active {
        transition: opacity 250ms ease;
    }
    .fade-leave {}
    .fade-leave-active {
        transition: opacity 250ms ease;
        opacity: 0;
    }
</style>
