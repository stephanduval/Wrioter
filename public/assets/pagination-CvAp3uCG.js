import{V as c}from"./VPagination-BsV7Dmwi.js";import{d as P,r as p,o as g,c as V,b as t,n as d,ah as m,g as v,K as C,f as i,e as l,t as o}from"./main-BaC4daP5.js";import{_ as z}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import{a as f,V as S}from"./VRow-MD441sKt.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";import"./VAvatar-C7kH6m2U.js";import"./VImg-DaBIesWz.js";import"./VCardText-yg2yyEKt.js";import"./VDivider-OHXYM3-S.js";/* empty css              */const j={class:"d-flex flex-column gap-6 px-4"},w=P({__name:"DemoPaginationSize",setup(_){const e=p(1),s=p(2),n=p(3);return(a,r)=>(g(),V("div",j,[t(c,{modelValue:d(e),"onUpdate:modelValue":r[0]||(r[0]=u=>m(e)?e.value=u:null),length:7,size:"small"},null,8,["modelValue"]),t(c,{modelValue:d(s),"onUpdate:modelValue":r[1]||(r[1]=u=>m(s)?s.value=u:null),length:7},null,8,["modelValue"]),t(c,{modelValue:d(n),"onUpdate:modelValue":r[2]||(r[2]=u=>m(n)?n.value=u:null),length:7,"total-visible":a.$vuetify.display.xs?1:7,size:"large"},null,8,["modelValue","total-visible"])]))}}),I={class:"d-flex flex-column gap-6"},T=P({__name:"DemoPaginationColor",setup(_){const e=p(1),s=p(2),n=p(3);return(a,r)=>(g(),V("div",I,[t(c,{modelValue:d(e),"onUpdate:modelValue":r[0]||(r[0]=u=>m(e)?e.value=u:null),length:7,"active-color":"success"},null,8,["modelValue"]),t(c,{modelValue:d(s),"onUpdate:modelValue":r[1]||(r[1]=u=>m(s)?s.value=u:null),length:7,"active-color":"error"},null,8,["modelValue"]),t(c,{modelValue:d(n),"onUpdate:modelValue":r[2]||(r[2]=u=>m(n)?n.value=u:null),length:7,"active-color":"info"},null,8,["modelValue"])]))}}),B=P({__name:"DemoPaginationTotalVisible",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),length:15,"total-visible":s.$vuetify.display.mdAndUp?7:3},null,8,["modelValue","total-visible"]))}}),E=P({__name:"DemoPaginationLength",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),length:15},null,8,["modelValue"]))}}),O=P({__name:"DemoPaginationIcons",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),length:5,"prev-icon":"bx-caret-left","next-icon":"bx-caret-right"},null,8,["modelValue"]))}}),A={};function k(_,e){return g(),v(c,{length:5,disabled:""})}const L=C(A,[["render",k]]),N=P({__name:"DemoPaginationOutlineCircle",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),variant:"outlined",length:5,rounded:"circle"},null,8,["modelValue"]))}}),R=P({__name:"DemoPaginationCircle",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),length:5,rounded:"circle"},null,8,["modelValue"]))}}),K=P({__name:"DemoPaginationOutline",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),variant:"outlined",length:5},null,8,["modelValue"]))}}),Y=P({__name:"DemoPaginationBasic",setup(_){const e=p(1);return(s,n)=>(g(),v(c,{modelValue:d(e),"onUpdate:modelValue":n[0]||(n[0]=a=>m(e)?e.value=a:null),length:5},null,8,["modelValue"]))}}),q={ts:`<script lang="ts" setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
  />
</template>
`},F={ts:`<script lang="ts" setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
    rounded="circle"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
    rounded="circle"
  />
</template>
`},G={ts:`<script setup lang="ts">
const pageSuccess = ref(1)
const pageError = ref(2)
const pageInfo = ref(3)
<\/script>

<template>
  <div class="d-flex flex-column gap-6">
    <VPagination
      v-model="pageSuccess"
      :length="7"
      active-color="success"
    />
    <VPagination
      v-model="pageError"
      :length="7"
      active-color="error"
    />
    <VPagination
      v-model="pageInfo"
      :length="7"
      active-color="info"
    />
  </div>
</template>
`,js:`<script setup>
const pageSuccess = ref(1)
const pageError = ref(2)
const pageInfo = ref(3)
<\/script>

<template>
  <div class="d-flex flex-column gap-6">
    <VPagination
      v-model="pageSuccess"
      :length="7"
      active-color="success"
    />
    <VPagination
      v-model="pageError"
      :length="7"
      active-color="error"
    />
    <VPagination
      v-model="pageInfo"
      :length="7"
      active-color="info"
    />
  </div>
</template>
`},H={ts:`<template>
  <VPagination
    :length="5"
    disabled
  />
</template>
`,js:`<template>
  <VPagination
    :length="5"
    disabled
  />
</template>
`},J={ts:`<script lang="ts" setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
    prev-icon="bx-caret-left"
    next-icon="bx-caret-right"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="5"
    prev-icon="bx-caret-left"
    next-icon="bx-caret-right"
  />
</template>
`},M={ts:`<script lang="ts" setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="15"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="15"
  />
</template>
`},Q={ts:`<script setup lang="ts">
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    variant="outlined"
    :length="5"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    variant="outlined"
    :length="5"
  />
</template>
`},W={ts:`<script setup lang="ts">
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    variant="outlined"
    :length="5"
    rounded="circle"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    variant="outlined"
    :length="5"
    rounded="circle"
  />
</template>
`},X={ts:`<script setup lang="ts">
const xSmallPagination = ref(1)
const smallPagination = ref(2)
const largePagination = ref(3)
<\/script>

<template>
  <div class="d-flex flex-column gap-6 px-4">
    <VPagination
      v-model="xSmallPagination"
      :length="7"
      size="small"
    />
    <VPagination
      v-model="smallPagination"
      :length="7"
    />
    <VPagination
      v-model="largePagination"
      :length="7"
      :total-visible="$vuetify.display.xs ? 1 : 7"
      size="large"
    />
  </div>
</template>
`,js:`<script setup>
const xSmallPagination = ref(1)
const smallPagination = ref(2)
const largePagination = ref(3)
<\/script>

<template>
  <div class="d-flex flex-column gap-6 px-4">
    <VPagination
      v-model="xSmallPagination"
      :length="7"
      size="small"
    />
    <VPagination
      v-model="smallPagination"
      :length="7"
    />
    <VPagination
      v-model="largePagination"
      :length="7"
      :total-visible="$vuetify.display.xs ? 1 : 7"
      size="large"
    />
  </div>
</template>
`},Z={ts:`<script lang="ts" setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="15"
    :total-visible="$vuetify.display.mdAndUp ? 7 : 3"
  />
</template>
`,js:`<script setup>
const currentPage = ref(1)
<\/script>

<template>
  <VPagination
    v-model="currentPage"
    :length="15"
    :total-visible="$vuetify.display.mdAndUp ? 7 : 3"
  />
</template>
`},ee=l("p",null,[o("The "),l("code",null,"v-pagination"),o(" component is used to separate long sets of data.")],-1),te=l("p",null,[o("The "),l("code",null,"variant='outline'"),o(" prop is used to give outline to pagination item.")],-1),ne=l("p",null,[o("The "),l("code",null,"rounded"),o(" prop allows you to render pagination buttons with alternative styles.")],-1),le=l("p",null,[o("The "),l("code",null,"variant='outline'"),o(" and "),l("code",null,"rounded"),o(" prop is used to give rounded outline to pagination item.")],-1),oe=l("p",null,[o("Pagination items can be manually deactivated using the "),l("code",null,"disabled"),o(" prop.")],-1),ae=l("p",null,[o("Previous and next page icons can be customized with the "),l("code",null,"prev-icon"),o(" and "),l("code",null,"next-icon"),o(" props.")],-1),ie=l("p",null,[o("Using the "),l("code",null,"length"),o(" prop you can set the length of "),l("code",null,"v-pagination"),o(", if the number of page buttons exceeds the parent container, it will truncate the list.")],-1),se=l("p",null,[o("You can also manually set the maximum number of visible page buttons with the "),l("code",null,"total-visible"),o(" prop.")],-1),re=l("p",null,[o("Use "),l("code",null,"active-color"),o(" prop for create different color pagination.")],-1),ce=l("p",null,[o("Use "),l("code",null,"size"),o(" prop to sets the height and width of the component. Default unit is px. Can also use the following predefined sizes: "),l("strong",null,"x-small"),o(", "),l("strong",null,"small"),o(", "),l("strong",null,"default"),o(", "),l("strong",null,"large"),o(", and "),l("strong",null,"x-large"),o(".")],-1),xe=P({__name:"pagination",setup(_){return(e,s)=>{const n=Y,a=z,r=K,u=R,h=N,x=L,b=O,D=E,U=B,$=T,y=w;return g(),v(S,{class:"match-height"},{default:i(()=>[t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Basic",code:q},{default:i(()=>[ee,t(n)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Outline",code:Q},{default:i(()=>[te,t(r)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Circle",code:F},{default:i(()=>[ne,t(u)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Outline Circle",code:W},{default:i(()=>[le,t(h)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Disabled",code:H},{default:i(()=>[oe,t(x)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Icons",code:J},{default:i(()=>[ae,t(b)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Length",code:M},{default:i(()=>[ie,t(D)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Total visible",code:Z},{default:i(()=>[se,t(U)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Color",code:G},{default:i(()=>[re,t($)]),_:1},8,["code"])]),_:1}),t(f,{cols:"12",md:"6"},{default:i(()=>[t(a,{title:"Size",code:X},{default:i(()=>[ce,t(y)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{xe as default};
