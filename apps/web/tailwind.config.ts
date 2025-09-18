import type { Config } from 'tailwindcss'


export default <Partial<Config>>{
content: [
'./components/**/*.{vue,js,ts}',
'./layouts/**/*.{vue,js,ts}',
'./pages/**/*.{vue,js,ts}',
'./plugins/**/*.{js,ts}',
'./app.vue'
],
theme: {
extend: {
colors: {
header: '#1E293B',
bg: '#F8FAFC',
text: '#64748B',
cta: '#10B981',
warn: '#F97316'
}
}
}
}
```


`apps/web/postcss.config.cjs`
```js
module.exports = {
plugins: {
tailwindcss: {},
autoprefixer: {}
}
}
