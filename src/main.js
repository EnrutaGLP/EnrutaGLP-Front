import Vue from 'vue';
import App from './App.vue';
import router from './routers';
import vuetify from './plugins/vuetify';
import './components/assets/styles.css';
import Vuelidate from 'vuelidate';
import VueSession from 'vue-session';
import VueApexCharts from 'vue-apexcharts'

Vue.config.productionTip = false;

Vue.use(Vuelidate);
Vue.use(VueSession);
Vue.use(VueApexCharts);

Vue.component('apexchart', VueApexCharts);
Vue.config.productionTip = false;

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app');
