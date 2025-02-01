import{_ as b}from"./AppSelect.vue_vue_type_script_setup_true_lang-CNMTrj_1.js";import{d as m,r as f,o as d,g as u,f as t,b as e,e as o,v as D,n as _,ah as v,az as I,aA as B,ap as w,an as O,ao as k,t as s}from"./main-BaC4daP5.js";import{V as y}from"./VChip-Cpn43Xaw.js";import{V as G}from"./VAvatar-C7kH6m2U.js";import{a as n,V as A}from"./VRow-MD441sKt.js";import{V}from"./VSelect-B-FnJIwa.js";import{_ as $}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import"./form-Bx6DrHT2.js";import"./VSlideGroup-CruuC3Lo.js";import"./VImg-DaBIesWz.js";/* empty css              */import"./VTextField-Cnd2jctO.js";/* empty css                   */import"./VCounter-BXlqD8Be.js";import"./VField-CelNtUMo.js";import"./easing-CjukEv2V.js";import"./VInput-khHNYcPy.js";import"./forwardRefs-C-GTDzx5.js";import"./VList-Cb4zClaU.js";import"./ssrBoot-ClC9I7WC.js";import"./VDivider-OHXYM3-S.js";import"./dialog-transition-Dg3jz69z.js";import"./VMenu-BqnSfr0Y.js";import"./VOverlay-BFLsqd3w.js";import"./delay-QQ7368Uq.js";import"./lazy-dhMtJnkj.js";import"./scopeId-ZR_fbP0-.js";import"./VCheckboxBtn-D5cOysU9.js";import"./VSelectionControl-CeD2QejG.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";import"./VCardText-yg2yyEKt.js";const N=m({__name:"DemoSelectSelectionSlot",setup(S){const a=[{name:"Sandra Adams",avatar:I},{name:"Ali Connors",avatar:B},{name:"Trevor Hansen",avatar:w},{name:"Tucker Smith",avatar:O},{name:"Britta Holt",avatar:k}],i=f(["Sandra Adams"]);return(p,l)=>{const c=b;return d(),u(c,{modelValue:_(i),"onUpdate:modelValue":l[0]||(l[0]=r=>v(i)?i.value=r:null),items:a,"item-title":"name","item-value":"name",label:"Select Item",placeholder:"Select Item",multiple:"",clearable:"","clear-icon":"bx-x"},{selection:t(({item:r})=>[e(y,null,{prepend:t(()=>[e(G,{start:"",image:r.raw.avatar},null,8,["image"])]),default:t(()=>[o("span",null,D(r.title),1)]),_:2},1024)]),_:1},8,["modelValue"])}}}),j=m({__name:"DemoSelectMultiple",setup(S){const a=f(["Alabama"]),i=["Alabama","Alaska","American Samoa","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Federated States of Micronesia","Florida","Georgia","Guam"];return(p,l)=>{const c=b;return d(),u(c,{modelValue:_(a),"onUpdate:modelValue":l[0]||(l[0]=r=>v(a)?a.value=r:null),items:i,"menu-props":{maxHeight:"400"},label:"Select",multiple:"","persistent-hint":"",placeholder:"Select State"},null,8,["modelValue"])}}}),T=m({__name:"DemoSelectMenuProps",setup(S){const a=["Foo","Bar","Fizz","Buzz"];return(i,p)=>{const l=b;return d(),u(l,{items:a,"menu-props":{transition:"scroll-y-transition"},label:"Label",placeholder:"Select Item"})}}}),U=m({__name:"DemoSelectChips",setup(S){const a=["foo","bar","fizz","buzz"],i=f(["foo","bar","fizz","buzz"]);return(p,l)=>{const c=b;return d(),u(c,{modelValue:_(i),"onUpdate:modelValue":l[0]||(l[0]=r=>v(i)?i.value=r:null),items:a,placeholder:"Select Item",label:"Chips",chips:"",multiple:"","closable-chips":""},null,8,["modelValue"])}}}),M=m({__name:"DemoSelectIcons",setup(S){const a=f("Florida"),i=f("Texas"),p=["Alabama","Alaska","American Samoa","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Federated States of Micronesia","Florida","Georgia","Guam"];return(l,c)=>{const r=b;return d(),u(A,null,{default:t(()=>[e(n,{cols:"12"},{default:t(()=>[e(r,{modelValue:_(a),"onUpdate:modelValue":c[0]||(c[0]=h=>v(a)?a.value=h:null),items:p,label:"Select","prepend-icon":"bx-map-alt","single-line":"",variant:"filled",placeholder:"Select State"},null,8,["modelValue"])]),_:1}),e(n,{cols:"12"},{default:t(()=>[e(r,{modelValue:_(i),"onUpdate:modelValue":c[1]||(c[1]=h=>v(i)?i.value=h:null),items:p,"append-icon":"bx-map-alt",label:"Select","single-line":"",variant:"filled",placeholder:"Select State"},null,8,["modelValue"])]),_:1})]),_:1})}}}),R=m({__name:"DemoSelectCustomTextAndValue",setup(S){const a=f({state:"Florida",abbr:"FL"}),i=[{state:"Florida",abbr:"FL"},{state:"Georgia",abbr:"GA"},{state:"Nebraska",abbr:"NE"},{state:"California",abbr:"CA"},{state:"New York",abbr:"NY"}];return(p,l)=>{const c=b;return d(),u(c,{modelValue:_(a),"onUpdate:modelValue":l[0]||(l[0]=r=>v(a)?a.value=r:null),hint:`${_(a).state}, ${_(a).abbr}`,items:i,"item-title":"state","item-value":"abbr",label:"Select","persistent-hint":"","return-object":"","single-line":"",placeholder:"Select State"},null,8,["modelValue","hint"])}}}),H=m({__name:"DemoSelectVariant",setup(S){const a=["Foo","Bar","Fizz","Buzz"];return(i,p)=>(d(),u(A,null,{default:t(()=>[e(n,{cols:"12",sm:"6"},{default:t(()=>[e(V,{items:a,label:"Outlined",placeholder:"Select Item"})]),_:1}),e(n,{cols:"12",sm:"6"},{default:t(()=>[e(V,{items:a,label:"Filled",placeholder:"Select Item",variant:"filled"})]),_:1}),e(n,{cols:"12",sm:"6"},{default:t(()=>[e(V,{items:a,label:"Solo",placeholder:"Select Item",variant:"solo"})]),_:1}),e(n,{cols:"12",sm:"6"},{default:t(()=>[e(V,{items:a,label:"Plain",placeholder:"Select Item",variant:"plain"})]),_:1}),e(n,{cols:"12",sm:"6"},{default:t(()=>[e(V,{items:a,label:"Underlined",variant:"underlined",placeholder:"Select Item"})]),_:1})]),_:1}))}}),L=m({__name:"DemoSelectDensity",setup(S){const a=["Foo","Bar","Fizz","Buzz"];return(i,p)=>{const l=b;return d(),u(l,{items:a,label:"Density",density:"compact",placeholder:"Select Item"})}}}),P=m({__name:"DemoSelectBasic",setup(S){const a=["Foo","Bar","Fizz","Buzz"];return(i,p)=>{const l=b;return d(),u(l,{items:a,label:"Standard",placeholder:"Select Item"})}}}),Y={ts:`<script lang="ts" setup>
const items = ['Foo', 'Bar', 'Fizz', 'Buzz']
<\/script>

<template>
  <AppSelect
    :items="items"
    label="Standard"
    placeholder="Select Item"
  />
</template>
`,js:`<script setup>
const items = [
  'Foo',
  'Bar',
  'Fizz',
  'Buzz',
]
<\/script>

<template>
  <AppSelect
    :items="items"
    label="Standard"
    placeholder="Select Item"
  />
</template>
`},E={ts:`<script lang="ts" setup>
const items = ['foo', 'bar', 'fizz', 'buzz']
const selected = ref(['foo', 'bar', 'fizz', 'buzz'])
<\/script>

<template>
  <AppSelect
    v-model="selected"
    :items="items"
    placeholder="Select Item"
    label="Chips"
    chips
    multiple
    closable-chips
  />
</template>
`,js:`<script setup>
const items = [
  'foo',
  'bar',
  'fizz',
  'buzz',
]

const selected = ref([
  'foo',
  'bar',
  'fizz',
  'buzz',
])
<\/script>

<template>
  <AppSelect
    v-model="selected"
    :items="items"
    placeholder="Select Item"
    label="Chips"
    chips
    multiple
    closable-chips
  />
</template>
`},q={ts:`<script lang="ts" setup>
const selectedOption = ref({ state: 'Florida', abbr: 'FL' })

const items = [
  { state: 'Florida', abbr: 'FL' },
  { state: 'Georgia', abbr: 'GA' },
  { state: 'Nebraska', abbr: 'NE' },
  { state: 'California', abbr: 'CA' },
  { state: 'New York', abbr: 'NY' },
]
<\/script>

<template>
  <AppSelect
    v-model="selectedOption"
    :hint="\`\${selectedOption.state}, \${selectedOption.abbr}\`"
    :items="items"
    item-title="state"
    item-value="abbr"
    label="Select"
    persistent-hint
    return-object
    single-line
    placeholder="Select State"
  />
</template>
`,js:`<script setup>
const selectedOption = ref({
  state: 'Florida',
  abbr: 'FL',
})

const items = [
  {
    state: 'Florida',
    abbr: 'FL',
  },
  {
    state: 'Georgia',
    abbr: 'GA',
  },
  {
    state: 'Nebraska',
    abbr: 'NE',
  },
  {
    state: 'California',
    abbr: 'CA',
  },
  {
    state: 'New York',
    abbr: 'NY',
  },
]
<\/script>

<template>
  <AppSelect
    v-model="selectedOption"
    :hint="\`\${selectedOption.state}, \${selectedOption.abbr}\`"
    :items="items"
    item-title="state"
    item-value="abbr"
    label="Select"
    persistent-hint
    return-object
    single-line
    placeholder="Select State"
  />
</template>
`},J={ts:`<script lang="ts" setup>
const items = ['Foo', 'Bar', 'Fizz', 'Buzz']
<\/script>

<template>
  <AppSelect
    :items="items"
    label="Density"
    density="compact"
    placeholder="Select Item"
  />
</template>
`,js:`<script setup>
const items = [
  'Foo',
  'Bar',
  'Fizz',
  'Buzz',
]
<\/script>

<template>
  <AppSelect
    :items="items"
    label="Density"
    density="compact"
    placeholder="Select Item"
  />
</template>
`},K={ts:`<script lang="ts" setup>
const selectedOption1 = ref('Florida')
const selectedOption2 = ref('Texas')

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Federated States of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
]
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppSelect
        v-model="selectedOption1"
        :items="states"
        label="Select"
        prepend-icon="bx-map-alt"
        single-line
        variant="filled"
        placeholder="Select State"
      />
    </VCol>

    <VCol cols="12">
      <AppSelect
        v-model="selectedOption2"
        :items="states"
        append-icon="bx-map-alt"
        label="Select"
        single-line
        variant="filled"
        placeholder="Select State"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const selectedOption1 = ref('Florida')
const selectedOption2 = ref('Texas')

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Federated States of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
]
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppSelect
        v-model="selectedOption1"
        :items="states"
        label="Select"
        prepend-icon="bx-map-alt"
        single-line
        variant="filled"
        placeholder="Select State"
      />
    </VCol>

    <VCol cols="12">
      <AppSelect
        v-model="selectedOption2"
        :items="states"
        append-icon="bx-map-alt"
        label="Select"
        single-line
        variant="filled"
        placeholder="Select State"
      />
    </VCol>
  </VRow>
</template>
`},Q={ts:`<script lang="ts" setup>
const items = ['Foo', 'Bar', 'Fizz', 'Buzz']
<\/script>

<template>
  <AppSelect
    :items="items"
    :menu-props="{ transition: 'scroll-y-transition' }"
    label="Label"
    placeholder="Select Item"
  />
</template>
`,js:`<script setup>
const items = [
  'Foo',
  'Bar',
  'Fizz',
  'Buzz',
]
<\/script>

<template>
  <AppSelect
    :items="items"
    :menu-props="{ transition: 'scroll-y-transition' }"
    label="Label"
    placeholder="Select Item"
  />
</template>
`},W={ts:`<script lang="ts" setup>
const selectedOptions = ref(['Alabama'])

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Federated States of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
]
<\/script>

<template>
  <AppSelect
    v-model="selectedOptions"
    :items="states"
    :menu-props="{ maxHeight: '400' }"
    label="Select"
    multiple
    persistent-hint
    placeholder="Select State"
  />
</template>
`,js:`<script setup>
const selectedOptions = ref(['Alabama'])

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Federated States of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
]
<\/script>

<template>
  <AppSelect
    v-model="selectedOptions"
    :items="states"
    :menu-props="{ maxHeight: '400' }"
    label="Select"
    multiple
    persistent-hint
    placeholder="Select State"
  />
</template>
`},X={ts:`<script lang="ts" setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'

const items: { name: string; avatar: string }[] = [
  { name: 'Sandra Adams', avatar: avatar1 },
  { name: 'Ali Connors', avatar: avatar2 },
  { name: 'Trevor Hansen', avatar: avatar3 },
  { name: 'Tucker Smith', avatar: avatar4 },
  { name: 'Britta Holt', avatar: avatar5 },
]

const value = ref(['Sandra Adams'])
<\/script>

<template>
  <AppSelect
    v-model="value"
    :items="items"
    item-title="name"
    item-value="name"
    label="Select Item"
    placeholder="Select Item"
    multiple
    clearable
    clear-icon="bx-x"
  >
    <template #selection="{ item }">
      <VChip>
        <template #prepend>
          <VAvatar
            start
            :image="item.raw.avatar"
          />
        </template>

        <span>{{ item.title }}</span>
      </VChip>
    </template>
  </AppSelect>
</template>
`,js:`<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'

const items = [
  {
    name: 'Sandra Adams',
    avatar: avatar1,
  },
  {
    name: 'Ali Connors',
    avatar: avatar2,
  },
  {
    name: 'Trevor Hansen',
    avatar: avatar3,
  },
  {
    name: 'Tucker Smith',
    avatar: avatar4,
  },
  {
    name: 'Britta Holt',
    avatar: avatar5,
  },
]

const value = ref(['Sandra Adams'])
<\/script>

<template>
  <AppSelect
    v-model="value"
    :items="items"
    item-title="name"
    item-value="name"
    label="Select Item"
    placeholder="Select Item"
    multiple
    clearable
    clear-icon="bx-x"
  >
    <template #selection="{ item }">
      <VChip>
        <template #prepend>
          <VAvatar
            start
            :image="item.raw.avatar"
          />
        </template>

        <span>{{ item.title }}</span>
      </VChip>
    </template>
  </AppSelect>
</template>
`},Z={ts:`<script lang="ts" setup>
const items = ['Foo', 'Bar', 'Fizz', 'Buzz']
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Outlined"
        placeholder="Select Item"
      />
    </VCol>
    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Filled"
        placeholder="Select Item"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Solo"
        placeholder="Select Item"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Plain"
        placeholder="Select Item"
        variant="plain"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Underlined"
        variant="underlined"
        placeholder="Select Item"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const items = [
  'Foo',
  'Bar',
  'Fizz',
  'Buzz',
]
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Outlined"
        placeholder="Select Item"
      />
    </VCol>
    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Filled"
        placeholder="Select Item"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Solo"
        placeholder="Select Item"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Plain"
        placeholder="Select Item"
        variant="plain"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VSelect
        :items="items"
        label="Underlined"
        variant="underlined"
        placeholder="Select Item"
      />
    </VCol>
  </VRow>
</template>
`},ee=o("p",null,"Select fields components are used for collecting user provided information from a list of options.",-1),te=o("p",null,[s("You can use "),o("code",null,"density"),s(" prop to reduce the field height and lower max height of list items.")],-1),ae=o("p",null,[s(" Use "),o("code",null,"filled"),s(", "),o("code",null,"outlined"),s(", "),o("code",null,"solo"),s(", "),o("code",null,"underlined"),s(" and "),o("code",null,"plain"),s(" options of "),o("code",null,"variant"),s(" prop to change appearance of select. ")],-1),le=o("p",null,"You can specify the specific properties within your items array that correspond to the title and value fields. In this example we also use the return-object prop which will return the entire object of the selected item on selection.",-1),oe=o("p",null,[s("Use a custom "),o("code",null,"prepend"),s(" or "),o("code",null,"appended"),s(" icon.")],-1),se=o("p",null,[s("Use "),o("code",null,"chips"),s(" prop to make selected option as chip.")],-1),ie=o("p",null,[s("Custom props can be passed directly to "),o("code",null,"v-menu"),s(" using "),o("code",null,"menuProps"),s(" prop.")],-1),ne=o("p",null,[s("Use "),o("code",null,"multiple"),s(" prop to select multiple option.")],-1),re=o("p",null,[s("The "),o("code",null,"selection"),s(" slot can be used to customize the way selected values are shown in the input.")],-1),Re=m({__name:"select",setup(S){return(a,i)=>{const p=P,l=$,c=L,r=H,h=R,C=M,z=U,g=T,F=j,x=N;return d(),u(A,null,{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Basic",code:Y},{default:t(()=>[ee,e(p)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Density",code:J},{default:t(()=>[te,e(c)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12"},{default:t(()=>[e(l,{title:"Variant",code:Z},{default:t(()=>[ae,e(r)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Custom text and value",code:q},{default:t(()=>[le,e(h)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Icons",code:K},{default:t(()=>[oe,e(C)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Chips",code:E},{default:t(()=>[se,e(z)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Menu Props",code:Q},{default:t(()=>[ie,e(g)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Multiple",code:W},{default:t(()=>[ne,e(F)]),_:1},8,["code"])]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(l,{title:"Selection slot",code:X},{default:t(()=>[re,e(x)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Re as default};
