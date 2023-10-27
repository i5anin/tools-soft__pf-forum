// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // убедитесь, что ваш файл маршрутизации правильно экспортируется
import { registerPlugins } from './plugins'
import '@fontsource/nunito'  // импорт шрифта Nunito

const app = createApp(App)
registerPlugins(app)
app.use(router)  // используйте маршрутизатор с вашим приложением
app.mount('#app')
