import{K as _,o as u,c as g,b as e,ax as s,d as y,r as f,n as v,ah as h,f as a,e as r,v as P,g as L,E as k,aH as $,w as M,t as o}from"./main-B_IkraXW.js";import{_ as x}from"./AppCardCode.vue_vue_type_style_index_0_lang-CAH7Ujg3.js";import{a as p,V as I}from"./VRow-DiOzgfmC.js";import"./vue3-perfect-scrollbar.esm-eIojcFHH.js";import"./VCard-CDhfKLoT.js";import"./VAvatar-BcpaEIM6.js";import"./VImg-BO9Zigf-.js";import"./VCardText-BYDOgmBH.js";import"./VDivider-Qh1iiapW.js";/* empty css              */const D={},U={class:"demo-space-y"};function T(m,l){return u(),g("div",U,[e(s,{color:"rgb(var(--v-theme-primary))","model-value":"75",striped:""}),e(s,{color:"rgb(var(--v-theme-success))","model-value":"55",striped:""}),e(s,{color:"rgb(var(--v-theme-warning))","model-value":"35",striped:""})])}const j=_(D,[["render",T]]),C={class:"demo-space-y"},R=y({__name:"DemoProgressLinearSlots",setup(m){const l=f(20),d=f(33),c=f(78);return(n,i)=>(u(),g("div",C,[e(s,{modelValue:v(c),"onUpdate:modelValue":i[0]||(i[0]=t=>h(c)?c.value=t:null),color:"primary",height:"8"},null,8,["modelValue"]),e(s,{modelValue:v(l),"onUpdate:modelValue":i[1]||(i[1]=t=>h(l)?l.value=t:null),color:"primary",height:"20"},{default:a(({value:t})=>[r("span",null,P(Math.ceil(t))+"%",1)]),_:1},8,["modelValue"]),e(s,{modelValue:v(d),"onUpdate:modelValue":i[2]||(i[2]=t=>h(d)?d.value=t:null),height:"20",color:"primary"},{default:a(()=>[r("span",null,P(Math.ceil(v(d)))+"%",1)]),_:1},8,["modelValue"])]))}}),S={},N={class:"demo-space-y"};function E(m,l){return u(),g("div",N,[e(s,{"model-value":"78",height:"8",color:"primary",rounded:!1}),e(s,{"model-value":"20",color:"primary",height:"20",rounded:!1}),e(s,{"model-value":"33",height:"20",color:"primary",rounded:!1})])}const Y=_(S,[["render",E]]),A={};function H(m,l){return u(),L(s,{color:"primary",indeterminate:"",reverse:""})}const K=_(A,[["render",H]]),q={};function z(m,l){return u(),L(s,{indeterminate:"",color:"primary"})}const F=_(q,[["render",z]]),G={class:"demo-space-y"},J=y({__name:"DemoProgressLinearBuffering",setup(m){const l=f(10),d=f(20),c=f(),n=()=>{clearInterval(c.value),c.value=setInterval(()=>{l.value+=Math.random()*10+5,d.value+=Math.random()*10+6},2e3)};return k(n),$(()=>{clearInterval(c.value)}),M(l,()=>{if(l.value<100)return!1;l.value=0,d.value=10,n()}),(i,t)=>(u(),g("div",G,[e(s,{modelValue:v(l),"onUpdate:modelValue":t[0]||(t[0]=V=>h(l)?l.value=V:null),color:"primary","buffer-value":v(d)},null,8,["modelValue","buffer-value"])]))}}),O={},Q={class:"demo-space-y"};function W(m,l){return u(),g("div",Q,[e(s,{"model-value":"15",color:"primary"}),e(s,{"model-value":"30",color:"secondary"}),e(s,{"model-value":"45",color:"success"})])}const X=_(O,[["render",W]]),Z={ts:`<script setup lang="ts">
const modelValue = ref(10)
const bufferValue = ref(20)
const interval = ref()

const startBuffer = () => {
  clearInterval(interval.value)

  interval.value = setInterval(() => {
    modelValue.value += Math.random() * (15 - 5) + 5
    bufferValue.value += Math.random() * (15 - 5) + 6
  }, 2000)
}

onMounted(startBuffer)

onBeforeUnmount(() => {
  clearInterval(interval.value)
})

watch(modelValue, () => {
  if (modelValue.value < 100)
    return false

  modelValue.value = 0
  bufferValue.value = 10
  startBuffer()
})
<\/script>

<template>
  <div class="demo-space-y">
    <VProgressLinear
      v-model="modelValue"
      color="primary"
      :buffer-value="bufferValue"
    />
  </div>
</template>
`,js:`<script setup>
const modelValue = ref(10)
const bufferValue = ref(20)
const interval = ref()

const startBuffer = () => {
  clearInterval(interval.value)
  interval.value = setInterval(() => {
    modelValue.value += Math.random() * (15 - 5) + 5
    bufferValue.value += Math.random() * (15 - 5) + 6
  }, 2000)
}

onMounted(startBuffer)
onBeforeUnmount(() => {
  clearInterval(interval.value)
})
watch(modelValue, () => {
  if (modelValue.value < 100)
    return false
  modelValue.value = 0
  bufferValue.value = 10
  startBuffer()
})
<\/script>

<template>
  <div class="demo-space-y">
    <VProgressLinear
      v-model="modelValue"
      color="primary"
      :buffer-value="bufferValue"
    />
  </div>
</template>
`},ee={ts:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      model-value="15"
      color="primary"
    />

    <VProgressLinear
      model-value="30"
      color="secondary"
    />

    <VProgressLinear
      model-value="45"
      color="success"
    />
  </div>
</template>
`,js:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      model-value="15"
      color="primary"
    />

    <VProgressLinear
      model-value="30"
      color="secondary"
    />

    <VProgressLinear
      model-value="45"
      color="success"
    />
  </div>
</template>
`},re={ts:`<template>
  <VProgressLinear
    indeterminate
    color="primary"
  />
</template>
`,js:`<template>
  <VProgressLinear
    indeterminate
    color="primary"
  />
</template>
`},oe={ts:`<template>
  <VProgressLinear
    color="primary"
    indeterminate
    reverse
  />
</template>
`,js:`<template>
  <VProgressLinear
    color="primary"
    indeterminate
    reverse
  />
</template>
`},le={ts:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      model-value="78"
      height="8"
      color="primary"
      :rounded="false"
    />

    <VProgressLinear
      model-value="20"
      color="primary"
      height="20"
      :rounded="false"
    />

    <VProgressLinear
      model-value="33"
      height="20"
      color="primary"
      :rounded="false"
    />
  </div>
</template>
`,js:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      model-value="78"
      height="8"
      color="primary"
      :rounded="false"
    />

    <VProgressLinear
      model-value="20"
      color="primary"
      height="20"
      :rounded="false"
    />

    <VProgressLinear
      model-value="33"
      height="20"
      color="primary"
      :rounded="false"
    />
  </div>
</template>
`},ae={ts:`<script setup lang="ts">
const skill = ref(20)
const knowledge = ref(33)
const power = ref(78)
<\/script>

<template>
  <div class="demo-space-y">
    <VProgressLinear
      v-model="power"
      color="primary"
      height="8"
    />

    <VProgressLinear
      v-model="skill"
      color="primary"
      height="20"
    >
      <template #default="{ value }">
        <span>{{ Math.ceil(value) }}%</span>
      </template>
    </VProgressLinear>

    <VProgressLinear
      v-model="knowledge"
      height="20"
      color="primary"
    >
      <span>{{ Math.ceil(knowledge) }}%</span>
    </VProgressLinear>
  </div>
</template>
`,js:`<script setup>
const skill = ref(20)
const knowledge = ref(33)
const power = ref(78)
<\/script>

<template>
  <div class="demo-space-y">
    <VProgressLinear
      v-model="power"
      color="primary"
      height="8"
    />

    <VProgressLinear
      v-model="skill"
      color="primary"
      height="20"
    >
      <template #default="{ value }">
        <span>{{ Math.ceil(value) }}%</span>
      </template>
    </VProgressLinear>

    <VProgressLinear
      v-model="knowledge"
      height="20"
      color="primary"
    >
      <span>{{ Math.ceil(knowledge) }}%</span>
    </VProgressLinear>
  </div>
</template>
`},se={ts:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      color="rgb(var(--v-theme-primary))"
      model-value="75"
      striped
    />

    <VProgressLinear
      color="rgb(var(--v-theme-success))"
      model-value="55"
      striped
    />

    <VProgressLinear
      color="rgb(var(--v-theme-warning))"
      model-value="35"
      striped
    />
  </div>
</template>
`,js:`<template>
  <div class="demo-space-y">
    <VProgressLinear
      color="rgb(var(--v-theme-primary))"
      model-value="75"
      striped
    />

    <VProgressLinear
      color="rgb(var(--v-theme-success))"
      model-value="55"
      striped
    />

    <VProgressLinear
      color="rgb(var(--v-theme-warning))"
      model-value="35"
      striped
    />
  </div>
</template>
`},te=r("p",null,[o("Use the props "),r("code",null,"color"),o(" and "),r("code",null,"background-color"),o(" to set colors.")],-1),ne=r("p",null,[o("The primary value is controlled by "),r("code",null,"v-model"),o(", whereas the buffer is controlled by the "),r("code",null,"buffer-value"),o(" prop.")],-1),de=r("p",null,[o("for continuously animating progress bar,use prop "),r("code",null,"indeterminate"),o(". This indicates continuous process. ")],-1),ce=r("p",null,[o("Use prop "),r("code",null,"reverse"),o(" to animate continuously in reverse direction. The component also has RTL support.")],-1),ie=r("p",null,[o(" The "),r("code",null," rounded "),o("prop is used to apply a border radius to the v-progress-linear component. By default we have set "),r("code",null,"rounded"),o(" prop true. You can disable it by using "),r("code",null,":rounded='false'"),o(". ")],-1),ue=r("p",null,[o("The v-progress-linear component will be responsive to user input when using "),r("code",null,"v-model"),o(". You can use the default slot or bind a local model to display inside of the progress.")],-1),me=r("p",null,[o(" The "),r("code",null,"striped"),o(" prop is used to apply striped background.")],-1),be=y({__name:"progress-linear",setup(m){return(l,d)=>{const c=X,n=x,i=J,t=F,V=K,b=Y,w=R,B=j;return u(),L(I,{class:"match-height"},{default:a(()=>[e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Color",code:ee},{default:a(()=>[te,e(c)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Buffering",code:Z},{default:a(()=>[ne,e(i)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Indeterminate",code:re},{default:a(()=>[de,e(t)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Reversed",code:oe},{default:a(()=>[ce,e(V)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Rounded",code:le},{default:a(()=>[ie,e(b)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Slots",code:ae},{default:a(()=>[ue,e(w)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:a(()=>[e(n,{title:"Striped",code:se},{default:a(()=>[me,e(B)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{be as default};
