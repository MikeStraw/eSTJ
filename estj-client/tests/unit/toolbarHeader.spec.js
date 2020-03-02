import { createLocalVue, shallowMount } from '@vue/test-utils'
import toolbarHeader from '@/components/toolbarHeader.vue'
import vuetify from 'vuetify'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

const testUser = { first: 'Buggs', last: 'Bunny' }

const storeWithUser = new Vuex.Store({
    modules: {
        auth: { namespaced: true, state: { user: testUser } }
    }
})

const storeNoUser = new Vuex.Store({
    modules: {
        auth: { namespaced: true, state: { user: false } }
    }
})

describe('toolbarHeader.vue', () => {
    it('renders a vue instance', () => {
        const wrp = shallowMount(toolbarHeader, { store: storeWithUser, localVue, vuetify })
        expect(wrp.isVueInstance()).toBeTruthy()
    })

    it('shows logout button when user exists', () => {
        const wrp = shallowMount(toolbarHeader, { store: storeWithUser, localVue, vuetify })
        expect(wrp.find('v-btn').isVisible()).toBe(true)
        expect(wrp.find('v-btn').text()).toContain('Log Out')
    })

    it('welcomes the user by first name when the users exists', () => {
        const wrp = shallowMount(toolbarHeader, { store: storeWithUser, localVue, vuetify })
        expect(wrp.text()).toContain(testUser.first)
    })

    it('does not show logout button when user does not exist', () => {
        const wrp = shallowMount(toolbarHeader, { store: storeNoUser, localVue, vuetify })
        expect(wrp.find('v-btn').exists()).toBe(false)
    })
})
