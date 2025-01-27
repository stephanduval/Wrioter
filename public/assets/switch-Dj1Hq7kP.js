import{V as r}from"./VSwitch-BiRxe1E-.js";import{d as w,r as m,o as h,c as b,b as t,n as a,ah as p,g as f,f as d,t as i,ay as y,e as c,v as L,F as _,i as $}from"./main-B_IkraXW.js";import{_ as D}from"./AppCardCode.vue_vue_type_style_index_0_lang-CAH7Ujg3.js";import{a as v,V as C}from"./VRow-DiOzgfmC.js";import"./VInput-DV2F-Zc0.js";import"./form-BHNnBXi0.js";import"./VImg-BO9Zigf-.js";import"./VSelectionControl-DF7kQOL_.js";import"./vue3-perfect-scrollbar.esm-eIojcFHH.js";import"./VCard-CDhfKLoT.js";import"./VAvatar-BcpaEIM6.js";import"./VCardText-BYDOgmBH.js";import"./VDivider-Qh1iiapW.js";/* empty css              */const U={class:"demo-space-x"},T=w({__name:"DemoSwitchStates",setup(S){const e=m("on"),o=m("on"),n=m(!0);return(l,s)=>(h(),b("div",U,[t(r,{modelValue:a(e),"onUpdate:modelValue":s[0]||(s[0]=u=>p(e)?e.value=u:null),value:"on",label:"On"},null,8,["modelValue"]),t(r,{label:"Off"}),t(r,{modelValue:a(o),"onUpdate:modelValue":s[1]||(s[1]=u=>p(o)?o.value=u:null),value:"on",disabled:"",label:"On disabled"},null,8,["modelValue"]),t(r,{disabled:"",label:"Off disabled"}),t(r,{modelValue:a(n),"onUpdate:modelValue":s[2]||(s[2]=u=>p(n)?n.value=u:null),loading:"warning",label:`${a(n)?"On":"Off"} loading`},null,8,["modelValue","label"])]))}}),J={class:"demo-space-x"},A=w({__name:"DemoSwitchTrueAndFalseValue",setup(S){const e=m(1),o=m("Show");return(n,l)=>(h(),b("div",J,[t(r,{modelValue:a(e),"onUpdate:modelValue":l[0]||(l[0]=s=>p(e)?e.value=s:null),label:a(e).toString(),"true-value":1,"false-value":0},null,8,["modelValue","label"]),t(r,{modelValue:a(o),"onUpdate:modelValue":l[1]||(l[1]=s=>p(o)?o.value=s:null),label:a(o).toString(),"true-value":"Show","false-value":"Hide"},null,8,["modelValue","label"])]))}}),F=w({__name:"DemoSwitchLabelSlot",setup(S){const e=m(!1);return(o,n)=>(h(),f(r,{modelValue:a(e),"onUpdate:modelValue":n[0]||(n[0]=l=>p(e)?e.value=l:null)},{label:d(()=>[i(" Turn on the progress: "),t(y,{indeterminate:a(e),class:"ms-2"},null,8,["indeterminate"])]),_:1},8,["modelValue"]))}}),M={class:"demo-space-x"},I={class:"mt-2 mb-0"},P=w({__name:"DemoSwitchModelAsArray",setup(S){const e=m(["John"]);return(o,n)=>(h(),b(_,null,[c("div",M,[t(r,{modelValue:a(e),"onUpdate:modelValue":n[0]||(n[0]=l=>p(e)?e.value=l:null),label:"John",value:"John"},null,8,["modelValue"]),t(r,{modelValue:a(e),"onUpdate:modelValue":n[1]||(n[1]=l=>p(e)?e.value=l:null),label:"Jacob",value:"Jacob"},null,8,["modelValue"])]),c("p",I,L(a(e)),1)],64))}}),j={class:"demo-space-x"},z=w({__name:"DemoSwitchColors",setup(S){const e=m(["Primary","Secondary","Success","Info","Warning","Error"]),o=m(["Primary","Secondary","Success","Info","Warning","Error"]);return(n,l)=>(h(),b("div",j,[(h(!0),b(_,null,$(a(o),s=>(h(),f(r,{key:s,modelValue:a(e),"onUpdate:modelValue":l[0]||(l[0]=u=>p(e)?e.value=u:null),label:s,value:s,color:s.toLowerCase()},null,8,["modelValue","label","value","color"]))),128))]))}}),B={class:"demo-space-x"},E=w({__name:"DemoSwitchInset",setup(S){const e=m(!0),o=m(!1);return(n,l)=>(h(),b("div",B,[t(r,{modelValue:a(e),"onUpdate:modelValue":l[0]||(l[0]=s=>p(e)?e.value=s:null),label:`Switch 1: ${a(e).toString()}`},null,8,["modelValue","label"]),t(r,{modelValue:a(o),"onUpdate:modelValue":l[1]||(l[1]=s=>p(o)?o.value=s:null),label:`Switch 2: ${a(o).toString()}`},null,8,["modelValue","label"])]))}}),k={class:"demo-space-x"},W=w({__name:"DemoSwitchBasic",setup(S){const e=m(!0),o=m(!1),n=l=>{const s=l.toString();return s.charAt(0).toUpperCase()+s.slice(1)};return(l,s)=>(h(),b("div",k,[t(r,{modelValue:a(e),"onUpdate:modelValue":s[0]||(s[0]=u=>p(e)?e.value=u:null),label:n(a(e))},null,8,["modelValue","label"]),t(r,{modelValue:a(o),"onUpdate:modelValue":s[1]||(s[1]=u=>p(o)?o.value=u:null),label:n(a(o))},null,8,["modelValue","label"])]))}}),H={ts:`<script lang="ts" setup>
const toggleSwitch = ref(true)
const toggleFalseSwitch = ref(false)

const capitalizedLabel = (label: boolean) => {
  const convertLabelText = label.toString()

  return convertLabelText.charAt(0).toUpperCase() + convertLabelText.slice(1)
}
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="toggleSwitch"
      :label="capitalizedLabel(toggleSwitch)"
    />

    <VSwitch
      v-model="toggleFalseSwitch"
      :label="capitalizedLabel(toggleFalseSwitch)"
    />
  </div>
</template>
`,js:`<script setup>
const toggleSwitch = ref(true)
const toggleFalseSwitch = ref(false)

const capitalizedLabel = label => {
  const convertLabelText = label.toString()
  
  return convertLabelText.charAt(0).toUpperCase() + convertLabelText.slice(1)
}
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="toggleSwitch"
      :label="capitalizedLabel(toggleSwitch)"
    />

    <VSwitch
      v-model="toggleFalseSwitch"
      :label="capitalizedLabel(toggleFalseSwitch)"
    />
  </div>
</template>
`},N={ts:`<script lang="ts" setup>
const selectedSwitch = ref(['Primary', 'Secondary', 'Success', 'Info', 'Warning', 'Error'])
const switches = ref(['Primary', 'Secondary', 'Success', 'Info', 'Warning', 'Error'])
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-for="item in switches"
      :key="item"
      v-model="selectedSwitch"
      :label="item"
      :value="item"
      :color="item.toLowerCase()"
    />
  </div>
</template>
`,js:`<script setup>
const selectedSwitch = ref([
  'Primary',
  'Secondary',
  'Success',
  'Info',
  'Warning',
  'Error',
])

const switches = ref([
  'Primary',
  'Secondary',
  'Success',
  'Info',
  'Warning',
  'Error',
])
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-for="item in switches"
      :key="item"
      v-model="selectedSwitch"
      :label="item"
      :value="item"
      :color="item.toLowerCase()"
    />
  </div>
</template>
`},R={ts:`<script lang="ts" setup>
const insetSwitch1 = ref(true)
const insetSwitch2 = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="insetSwitch1"
      :label="\`Switch 1: \${insetSwitch1.toString()}\`"
    />
    <VSwitch
      v-model="insetSwitch2"
      :label="\`Switch 2: \${insetSwitch2.toString()}\`"
    />
  </div>
</template>
`,js:`<script setup>
const insetSwitch1 = ref(true)
const insetSwitch2 = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="insetSwitch1"
      :label="\`Switch 1: \${insetSwitch1.toString()}\`"
    />
    <VSwitch
      v-model="insetSwitch2"
      :label="\`Switch 2: \${insetSwitch2.toString()}\`"
    />
  </div>
</template>
`},q={ts:`<script lang="ts" setup>
const switchMe = ref(false)
<\/script>

<template>
  <VSwitch v-model="switchMe">
    <template #label>
      Turn on the progress: <VProgressCircular
        :indeterminate="switchMe"
        class="ms-2"
      />
    </template>
  </VSwitch>
</template>
`,js:`<script setup>
const switchMe = ref(false)
<\/script>

<template>
  <VSwitch v-model="switchMe">
    <template #label>
      Turn on the progress: <VProgressCircular
        :indeterminate="switchMe"
        class="ms-2"
      />
    </template>
  </VSwitch>
</template>
`},G={ts:`<script lang="ts" setup>
const people = ref(['John'])
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="people"
      label="John"
      value="John"
    />

    <VSwitch
      v-model="people"
      label="Jacob"
      value="Jacob"
    />
  </div>

  <p class="mt-2 mb-0">
    {{ people }}
  </p>
</template>
`,js:`<script setup>
const people = ref(['John'])
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="people"
      label="John"
      value="John"
    />

    <VSwitch
      v-model="people"
      label="Jacob"
      value="Jacob"
    />
  </div>

  <p class="mt-2 mb-0">
    {{ people }}
  </p>
</template>
`},K={ts:`<script setup lang="ts">
const switchOn = ref('on')
const switchOnDisabled = ref('on')
const switchOnLoading = ref(true)
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="switchOn"
      value="on"
      label="On"
    />

    <VSwitch label="Off" />

    <VSwitch
      v-model="switchOnDisabled"
      value="on"
      disabled
      label="On disabled"
    />

    <VSwitch
      disabled
      label="Off disabled"
    />

    <VSwitch
      v-model="switchOnLoading"
      loading="warning"
      :label="\`\${switchOnLoading ? 'On' : 'Off'} loading\`"
    />
  </div>
</template>
`,js:`<script setup>
const switchOn = ref('on')
const switchOnDisabled = ref('on')
const switchOnLoading = ref(true)
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="switchOn"
      value="on"
      label="On"
    />

    <VSwitch label="Off" />

    <VSwitch
      v-model="switchOnDisabled"
      value="on"
      disabled
      label="On disabled"
    />

    <VSwitch
      disabled
      label="Off disabled"
    />

    <VSwitch
      v-model="switchOnLoading"
      loading="warning"
      :label="\`\${switchOnLoading ? 'On' : 'Off'} loading\`"
    />
  </div>
</template>
`},Q={ts:`<script lang="ts" setup>
const switch1 = ref(1)
const switch2 = ref('Show')
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="switch1"
      :label="switch1.toString()"
      :true-value="1"
      :false-value="0"
    />

    <VSwitch
      v-model="switch2"
      :label="switch2.toString()"
      true-value="Show"
      false-value="Hide"
    />
  </div>
</template>
`,js:`<script setup>
const switch1 = ref(1)
const switch2 = ref('Show')
<\/script>

<template>
  <div class="demo-space-x">
    <VSwitch
      v-model="switch1"
      :label="switch1.toString()"
      :true-value="1"
      :false-value="0"
    />

    <VSwitch
      v-model="switch2"
      :label="switch2.toString()"
      true-value="Show"
      false-value="Hide"
    />
  </div>
</template>
`},X=c("p",null,[i("A "),c("code",null,"v-switch"),i(" in its simplest form provides a toggle between 2 values.")],-1),Y=c("p",null,[i("To change the default "),c("code",null,"inset"),i(" switch, simply modify the inset prop to a "),c("code",null,"false"),i(" value.")],-1),Z=c("p",null,[i("Switches can be colored by using any of the builtin colors and contextual names using the "),c("code",null,"color"),i(" prop.")],-1),ee=c("p",null,[i("Multiple "),c("code",null,"v-switch"),i("'s can share the same "),c("code",null,"v-model"),i(" by using an array.")],-1),te=c("p",null,[i("Switch labels can be defined in "),c("code",null,"label"),i(" slot - that will allow to use HTML content.")],-1),le=c("p",null,[i(" Use "),c("code",null,"false-value"),i(" and "),c("code",null,"true-value"),i(" prop to sets value for truthy and falsy state ")],-1),se=c("p",null,[c("code",null,"v-switch"),i(" can have different states such as "),c("code",null,"default"),i(", "),c("code",null,"disabled"),i(", and "),c("code",null,"loading"),i(".")],-1),be=w({__name:"switch",setup(S){return(e,o)=>{const n=W,l=D,s=E,u=z,g=P,V=F,x=A,O=T;return h(),f(C,null,{default:d(()=>[t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Basic",code:H},{default:d(()=>[X,t(n)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Inset",code:R},{default:d(()=>[Y,t(s)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Colors",code:N},{default:d(()=>[Z,t(u)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Model as array",code:G},{default:d(()=>[ee,t(g)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Label slot",code:q},{default:d(()=>[te,t(V)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"True and False Value",code:Q},{default:d(()=>[le,t(x)]),_:1},8,["code"])]),_:1}),t(v,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"States",code:K},{default:d(()=>[se,t(O)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{be as default};
