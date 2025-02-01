import{_ as S,V as A}from"./AppAutocomplete.vue_vue_type_script_setup_true_lang-D6zuiBTp.js";import{d as g,r as _,o as h,g as v,n as u,ah as C,f as o,b as e,dM as T,a2 as G,w as I,q as w,az as F,aA as D,ap as W,an as R,ao as O,aM as L,aL as H,dj as E,e as i,t as r}from"./main-COzPSvmz.js";import{V as U}from"./VChip-DPeYBiGA.js";import{a as P}from"./VList-CNvbjYBq.js";import{a as m,V}from"./VRow-BJ3vRaQf.js";import{_ as q}from"./AppCardCode.vue_vue_type_style_index_0_lang-CHcTsrkT.js";import"./form-D3LuPyIe.js";import"./VSelect-B9TDWHSZ.js";import"./VTextField-Bvt5xpEn.js";/* empty css                   */import"./VCounter-D7mVbNfZ.js";import"./VImg-Mm9y2cRD.js";import"./VField-DTZzSet7.js";import"./easing-CjukEv2V.js";import"./VInput-DmbVP3f3.js";import"./forwardRefs-C-GTDzx5.js";import"./dialog-transition-svcbKRDj.js";import"./VMenu-Wpc6e35-.js";import"./VOverlay-NcYmFA8g.js";import"./delay-BHYXvR4k.js";import"./lazy-D9Z9oHvh.js";import"./scopeId-Cu4Sm8bO.js";import"./VCheckboxBtn-Jm2QJJl5.js";import"./VSelectionControl-DTAglom5.js";import"./VAvatar-BgzCTEhE.js";import"./filter-ClxjHxUY.js";import"./VSlideGroup-S6brIomR.js";import"./ssrBoot-5xkFD_xz.js";import"./VDivider-BaT1F8ur.js";/* empty css              */import"./vue3-perfect-scrollbar.esm-DhWXpBVy.js";import"./VCard-n1X1cK2l.js";import"./VCardText-Cwvv1NXL.js";const z=g({__name:"DemoAutocompleteValidation",setup(f){const a=["foo","bar","fizz","buzz"],s=_(["foo"]),c=[t=>!!t.length||"Select at least one option."];return(t,n)=>{const p=S;return h(),v(p,{modelValue:u(s),"onUpdate:modelValue":n[0]||(n[0]=l=>C(s)?s.value=l:null),items:a,rules:c,placeholder:"Select Option",multiple:""},null,8,["modelValue"])}}}),$=g({__name:"DemoAutocompleteStateSelector",setup(f){const a=_(!1),s=_(null),c=["Alabama","Alaska","American Samoa","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Federated States of Micronesia","Florida","Georgia","Guam","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Marshall Islands","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Northern Mariana Islands","Ohio","Oklahoma","Oregon","Palau","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virgin Island","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];return(t,n)=>{const p=S;return h(),v(p,{modelValue:u(s),"onUpdate:modelValue":n[1]||(n[1]=l=>C(s)?s.value=l:null),hint:u(a)?"Click the icon to save":"Click the icon to edit",placeholder:"Select Your State",items:c,readonly:!u(a),label:`State — ${u(a)?"Editable":"Readonly"}`,"persistent-hint":"","prepend-icon":"bx-building","menu-props":{maxHeight:"200px"}},{append:o(()=>[e(T,{mode:"out-in"},{default:o(()=>[(h(),v(G,{key:`icon-${u(a)}`,color:u(a)?"success":"info",icon:u(a)?"bx-check-double":"bx-edit",onClick:n[0]||(n[0]=l=>a.value=!u(a))},null,8,["color","icon"]))]),_:1})]),_:1},8,["modelValue","hint","readonly","label"])}}}),Y=g({__name:"DemoAutocompleteAsyncItems",setup(f){const a=_(!1),s=_(),c=_(null),t=["Alabama","Alaska","American Samoa","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Federated States of Micronesia","Florida","Georgia","Guam","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Marshall Islands","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Northern Mariana Islands","Ohio","Oklahoma","Oregon","Palau","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virgin Island","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],n=_(t),p=l=>{a.value=!0,setTimeout(()=>{n.value=t.filter(d=>(d||"").toLowerCase().includes((l||"").toLowerCase())),a.value=!1},500)};return I(s,l=>{l&&l!==c.value&&p(l)}),(l,d)=>(h(),v(A,{modelValue:u(c),"onUpdate:modelValue":d[0]||(d[0]=b=>C(c)?c.value=b:null),search:u(s),"onUpdate:search":d[1]||(d[1]=b=>C(s)?s.value=b:null),loading:u(a),items:u(n),placeholder:"Search for a state",label:"What state are you from?",variant:"underlined","menu-props":{maxHeight:"200px"}},null,8,["modelValue","search","loading","items"]))}}),j=g({__name:"DemoAutocompleteSlots",setup(f){const a=_(["Sandra Adams","Britta Holt"]),s=[{name:"Sandra Adams",group:"Group 1",avatar:F},{name:"Ali Connors",group:"Group 1",avatar:D},{name:"Trevor Hansen",group:"Group 1",avatar:W},{name:"Tucker Smith",group:"Group 1",avatar:R},{name:"Britta Holt",group:"Group 2",avatar:O},{name:"Jane Smith ",group:"Group 2",avatar:L},{name:"John Smith",group:"Group 2",avatar:H},{name:"Sandra Williams",group:"Group 2",avatar:E}];return(c,t)=>{const n=S;return h(),v(n,{modelValue:u(a),"onUpdate:modelValue":t[0]||(t[0]=p=>C(a)?a.value=p:null),chips:"","closable-chips":"",multiple:"",items:s,"item-title":"name","item-value":"name",placeholder:"Select User",label:"Select"},{chip:o(({props:p,item:l})=>[e(U,w(p,{"prepend-avatar":l.raw.avatar,text:l.raw.name}),null,16,["prepend-avatar","text"])]),item:o(({props:p,item:l})=>{var d,b,y;return[e(P,w(p,{"prepend-avatar":(d=l==null?void 0:l.raw)==null?void 0:d.avatar,title:(b=l==null?void 0:l.raw)==null?void 0:b.name,subtitle:(y=l==null?void 0:l.raw)==null?void 0:y.group}),null,16,["prepend-avatar","title","subtitle"])]}),_:1},8,["modelValue"])}}}),B=g({__name:"DemoAutocompleteCustomFilter",setup(f){const a=[{name:"Florida",abbr:"FL",id:1},{name:"Georgia",abbr:"GA",id:2},{name:"Nebraska",abbr:"NE",id:3},{name:"California",abbr:"CA",id:4},{name:"New York",abbr:"NY",id:5}];function s(c,t,n){const p=n.raw.name.toLowerCase(),l=n.raw.abbr.toLowerCase(),d=t.toLowerCase();return p.includes(d)||l.includes(d)}return(c,t)=>{const n=S;return h(),v(n,{label:"States",items:a,"custom-filter":s,"item-title":"name","item-value":"abbr",placeholder:"Select State"})}}}),J=g({__name:"DemoAutocompleteChips",setup(f){const a=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(s,c)=>{const t=S;return h(),v(t,{label:"States",items:a,placeholder:"Select State",chips:"",multiple:"","closable-chips":""})}}}),K=g({__name:"DemoAutocompleteClearable",setup(f){const a=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(s,c)=>{const t=S;return h(),v(t,{label:"States",items:a,multiple:"",placeholder:"Select State",clearable:""})}}}),X=g({__name:"DemoAutocompleteMultiple",setup(f){const a=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(s,c)=>{const t=S;return h(),v(t,{label:"States",items:a,placeholder:"Select State",multiple:"",eager:""})}}}),Q=g({__name:"DemoAutocompleteVariant",setup(f){const a=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(s,c)=>(h(),v(V,null,{default:o(()=>[e(m,{cols:"12",md:"6"},{default:o(()=>[e(A,{variant:"solo",label:"Solo",items:a,placeholder:"Select State"})]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(A,{variant:"outlined",label:"Outlined",placeholder:"Select State",items:a})]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(A,{variant:"underlined",label:"Underlined",placeholder:"Select State",items:a})]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(A,{variant:"filled",label:"Filled",placeholder:"Select State",items:a})]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(A,{variant:"plain",label:"Plain",placeholder:"Select State",items:a})]),_:1})]),_:1}))}}),Z=g({__name:"DemoAutocompleteDensity",setup(f){const a=_("Florida"),s=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(c,t)=>{const n=S;return h(),v(n,{modelValue:u(a),"onUpdate:modelValue":t[0]||(t[0]=p=>C(a)?a.value=p:null),label:"States",density:"compact",placeholder:"Select State",items:s},null,8,["modelValue"])}}}),ee=g({__name:"DemoAutocompleteBasic",setup(f){const a=["California","Colorado","Florida","Georgia","Texas","Wyoming"];return(s,c)=>{const t=S;return h(),v(t,{label:"States",items:a,placeholder:"Select State"})}}}),ae={ts:`<script setup lang="ts">
const loading = ref(false)
const search = ref()
const select = ref(null)

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
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Island',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]

const items = ref(states)

const querySelections = (query: string) => {
  loading.value = true

  // Simulated ajax query
  setTimeout(() => {
    items.value = states.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
    loading.value = false
  }, 500)
}

watch(search, query => {
  query && query !== select.value && querySelections(query)
})
<\/script>

<template>
  <VAutocomplete
    v-model="select"
    v-model:search="search"
    :loading="loading"
    :items="items"
    placeholder="Search for a state"
    label="What state are you from?"
    variant="underlined"
    :menu-props="{ maxHeight: '200px' }"
  />
</template>
`,js:`<script setup>
const loading = ref(false)
const search = ref()
const select = ref(null)

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
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Island',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]

const items = ref(states)

const querySelections = query => {
  loading.value = true

  // Simulated ajax query
  setTimeout(() => {
    items.value = states.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
    loading.value = false
  }, 500)
}

watch(search, query => {
  query && query !== select.value && querySelections(query)
})
<\/script>

<template>
  <VAutocomplete
    v-model="select"
    v-model:search="search"
    :loading="loading"
    :items="items"
    placeholder="Search for a state"
    label="What state are you from?"
    variant="underlined"
    :menu-props="{ maxHeight: '200px' }"
  />
</template>
`},te={ts:`<script setup lang="ts">
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
  />
</template>
`,js:`<script setup>
const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
  />
</template>
`},oe={ts:`<script setup lang="ts">
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
    chips
    multiple
    closable-chips
  />
</template>
`,js:`<script setup>
const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
    chips
    multiple
    closable-chips
  />
</template>
`},le={ts:`<script setup lang="ts">
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    multiple
    placeholder="Select State"
    clearable
  />
</template>
`,js:`<script setup>
const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    multiple
    placeholder="Select State"
    clearable
  />
</template>
`},ie={ts:`<script setup lang="ts">
const states = [
  { name: 'Florida', abbr: 'FL', id: 1 },
  { name: 'Georgia', abbr: 'GA', id: 2 },
  { name: 'Nebraska', abbr: 'NE', id: 3 },
  { name: 'California', abbr: 'CA', id: 4 },
  { name: 'New York', abbr: 'NY', id: 5 },
]

function customFilter(itemTitle: any, queryText: any, item: any) {
  const textOne = item.raw.name.toLowerCase()
  const textTwo = item.raw.abbr.toLowerCase()
  const searchText = queryText.toLowerCase()

  return textOne.includes(searchText) || textTwo.includes(searchText)
}
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="states"
    :custom-filter="customFilter"
    item-title="name"
    item-value="abbr"
    placeholder="Select State"
  />
</template>
`,js:`<script setup>
const states = [
  {
    name: 'Florida',
    abbr: 'FL',
    id: 1,
  },
  {
    name: 'Georgia',
    abbr: 'GA',
    id: 2,
  },
  {
    name: 'Nebraska',
    abbr: 'NE',
    id: 3,
  },
  {
    name: 'California',
    abbr: 'CA',
    id: 4,
  },
  {
    name: 'New York',
    abbr: 'NY',
    id: 5,
  },
]

function customFilter(itemTitle, queryText, item) {
  const textOne = item.raw.name.toLowerCase()
  const textTwo = item.raw.abbr.toLowerCase()
  const searchText = queryText.toLowerCase()
  
  return textOne.includes(searchText) || textTwo.includes(searchText)
}
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="states"
    :custom-filter="customFilter"
    item-title="name"
    item-value="abbr"
    placeholder="Select State"
  />
</template>
`},se={ts:`<script setup lang="ts">
const select = ref('Florida')
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <AppAutocomplete
    v-model="select"
    label="States"
    density="compact"
    placeholder="Select State"
    :items="items"
  />
</template>
`,js:`<script setup>
const select = ref('Florida')

const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    v-model="select"
    label="States"
    density="compact"
    placeholder="Select State"
    :items="items"
  />
</template>
`},re={ts:`<script setup lang="ts">
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
    multiple
    eager
  />
</template>
`,js:`<script setup>
const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    label="States"
    :items="items"
    placeholder="Select State"
    multiple
    eager
  />
</template>
`},ne={ts:`<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'

const friends = ref(['Sandra Adams', 'Britta Holt'])

const people = [
  { name: 'Sandra Adams', group: 'Group 1', avatar: avatar1 },
  { name: 'Ali Connors', group: 'Group 1', avatar: avatar2 },
  { name: 'Trevor Hansen', group: 'Group 1', avatar: avatar3 },
  { name: 'Tucker Smith', group: 'Group 1', avatar: avatar4 },
  { name: 'Britta Holt', group: 'Group 2', avatar: avatar5 },
  { name: 'Jane Smith ', group: 'Group 2', avatar: avatar6 },
  { name: 'John Smith', group: 'Group 2', avatar: avatar7 },
  { name: 'Sandra Williams', group: 'Group 2', avatar: avatar8 },
]
<\/script>

<template>
  <AppAutocomplete
    v-model="friends"
    chips
    closable-chips
    multiple
    :items="people"
    item-title="name"
    item-value="name"
    placeholder="Select User"
    label="Select"
  >
    <template #chip="{ props, item }">
      <VChip
        v-bind="props"
        :prepend-avatar="item.raw.avatar"
        :text="item.raw.name"
      />
    </template>

    <template #item="{ props, item }">
      <VListItem
        v-bind="props"
        :prepend-avatar="item?.raw?.avatar"
        :title="item?.raw?.name"
        :subtitle="item?.raw?.group"
      />
    </template>
  </AppAutocomplete>
</template>
`,js:`<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'

const friends = ref([
  'Sandra Adams',
  'Britta Holt',
])

const people = [
  {
    name: 'Sandra Adams',
    group: 'Group 1',
    avatar: avatar1,
  },
  {
    name: 'Ali Connors',
    group: 'Group 1',
    avatar: avatar2,
  },
  {
    name: 'Trevor Hansen',
    group: 'Group 1',
    avatar: avatar3,
  },
  {
    name: 'Tucker Smith',
    group: 'Group 1',
    avatar: avatar4,
  },
  {
    name: 'Britta Holt',
    group: 'Group 2',
    avatar: avatar5,
  },
  {
    name: 'Jane Smith ',
    group: 'Group 2',
    avatar: avatar6,
  },
  {
    name: 'John Smith',
    group: 'Group 2',
    avatar: avatar7,
  },
  {
    name: 'Sandra Williams',
    group: 'Group 2',
    avatar: avatar8,
  },
]
<\/script>

<template>
  <AppAutocomplete
    v-model="friends"
    chips
    closable-chips
    multiple
    :items="people"
    item-title="name"
    item-value="name"
    placeholder="Select User"
    label="Select"
  >
    <template #chip="{ props, item }">
      <VChip
        v-bind="props"
        :prepend-avatar="item.raw.avatar"
        :text="item.raw.name"
      />
    </template>

    <template #item="{ props, item }">
      <VListItem
        v-bind="props"
        :prepend-avatar="item?.raw?.avatar"
        :title="item?.raw?.name"
        :subtitle="item?.raw?.group"
      />
    </template>
  </AppAutocomplete>
</template>
`},ce={ts:`<script setup lang="ts">
const isEditing = ref(false)
const selectedState = ref(null)

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
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Island',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    v-model="selectedState"
    :hint="!isEditing ? 'Click the icon to edit' : 'Click the icon to save'"
    placeholder="Select Your State"
    :items="states"
    :readonly="!isEditing"
    :label="\`State — \${isEditing ? 'Editable' : 'Readonly'}\`"
    persistent-hint
    prepend-icon="bx-building"
    :menu-props="{ maxHeight: '200px' }"
  >
    <template #append>
      <VSlideXReverseTransition mode="out-in">
        <VIcon
          :key="\`icon-\${isEditing}\`"
          :color="isEditing ? 'success' : 'info'"
          :icon="isEditing ? 'bx-check-double' : 'bx-edit'"
          @click="isEditing = !isEditing"
        />
      </VSlideXReverseTransition>
    </template>
  </AppAutocomplete>
</template>
`,js:`<script setup>
const isEditing = ref(false)
const selectedState = ref(null)

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
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Island',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]
<\/script>

<template>
  <AppAutocomplete
    v-model="selectedState"
    :hint="!isEditing ? 'Click the icon to edit' : 'Click the icon to save'"
    placeholder="Select Your State"
    :items="states"
    :readonly="!isEditing"
    :label="\`State — \${isEditing ? 'Editable' : 'Readonly'}\`"
    persistent-hint
    prepend-icon="bx-building"
    :menu-props="{ maxHeight: '200px' }"
  >
    <template #append>
      <VSlideXReverseTransition mode="out-in">
        <VIcon
          :key="\`icon-\${isEditing}\`"
          :color="isEditing ? 'success' : 'info'"
          :icon="isEditing ? 'bx-check-double' : 'bx-edit'"
          @click="isEditing = !isEditing"
        />
      </VSlideXReverseTransition>
    </template>
  </AppAutocomplete>
</template>
`},pe={ts:`<script setup lang="ts">
const items = ['foo', 'bar', 'fizz', 'buzz']
const values = ref(['foo'])
const nameRules = [(v: string) => !!v.length || 'Select at least one option.']
<\/script>

<template>
  <AppAutocomplete
    v-model="values"
    :items="items"
    :rules="nameRules"
    placeholder="Select Option"
    multiple
  />
</template>
`,js:`<script setup>
const items = [
  'foo',
  'bar',
  'fizz',
  'buzz',
]

const values = ref(['foo'])
const nameRules = [v => !!v.length || 'Select at least one option.']
<\/script>

<template>
  <AppAutocomplete
    v-model="values"
    :items="items"
    :rules="nameRules"
    placeholder="Select Option"
    multiple
  />
</template>
`},me={ts:`<script setup lang="ts">
const items = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 solo variant  -->
      <VAutocomplete
        variant="solo"
        label="Solo"
        :items="items"
        placeholder="Select State"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 outlined variant -->
      <VAutocomplete
        variant="outlined"
        label="Outlined"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 underlined variant -->
      <VAutocomplete
        variant="underlined"
        label="Underlined"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 filled variant  -->
      <VAutocomplete
        variant="filled"
        label="Filled"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!--  👉 plain variant -->
      <VAutocomplete
        variant="plain"
        label="Plain"
        placeholder="Select State"
        :items="items"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const items = [
  'California',
  'Colorado',
  'Florida',
  'Georgia',
  'Texas',
  'Wyoming',
]
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 solo variant  -->
      <VAutocomplete
        variant="solo"
        label="Solo"
        :items="items"
        placeholder="Select State"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 outlined variant -->
      <VAutocomplete
        variant="outlined"
        label="Outlined"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 underlined variant -->
      <VAutocomplete
        variant="underlined"
        label="Underlined"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 filled variant  -->
      <VAutocomplete
        variant="filled"
        label="Filled"
        placeholder="Select State"
        :items="items"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!--  👉 plain variant -->
      <VAutocomplete
        variant="plain"
        label="Plain"
        placeholder="Select State"
        :items="items"
      />
    </VCol>
  </VRow>
</template>
`},ue=i("p",null,[r(" The "),i("code",null," v-autocomplete "),r(" component offers simple and flexible type-ahead functionality. This is useful when searching large sets of data or even dynamically fetching information from an API. ")],-1),de=i("p",null,[r(" You can use "),i("code",null," density "),r(" prop to adjusts vertical spacing within the component. Available options are: "),i("code",null,"default"),r(", "),i("code",null,"comfortable"),r(", and "),i("code",null,"compact"),r(". ")],-1),he=i("p",null,[r("Use "),i("code",null,"Solo"),r(", "),i("code",null,"Outlined"),r(", "),i("code",null,"Underlined"),r(", "),i("code",null,"Filled"),r(" and "),i("code",null,"Plain"),r(" options of "),i("code",null,"variant"),r(" prop to change the look of Autocomplete. ")],-1),ve=i("p",null,[r("Use "),i("code",null,"multiple"),r(" prop to select multiple. Accepts array for value")],-1),ge=i("p",null,[r("Use "),i("code",null,"clearable"),r(" prop to add input clear functionality.")],-1),fe=i("p",null,[r("Use "),i("code",null," chips "),r(" prop to use chips in select.")],-1),_e=i("p",null,[r("The "),i("code",null," custom-filter "),r(" prop can be used to filter each individual item with custom logic.In example we will filter state based on their name and abbreviations ")],-1),Se=i("p",null,"With the power of slots, you can customize the visual output of the select. In this example we add a profile picture for both the chips and list items using their props. ",-1),be=i("p",null,"Sometimes you need to load data externally based upon a search query. ",-1),Ae=i("p",null,"Using a combination of v-autocomplete slots and transitions, you can create a stylish toggle able autocomplete field such as below state selector.",-1),Ce=i("p",null,[r("Use "),i("code",null,"rules"),r(" prop to validate autocomplete. Accepts a mixed array of types function, boolean and string. Functions pass an input value as an argument and must return either true / false or a string containing an error message.")],-1),ta=g({__name:"autocomplete",setup(f){return(a,s)=>{const c=ee,t=q,n=Z,p=Q,l=X,d=K,b=J,y=B,x=j,M=Y,k=$,N=z;return h(),v(V,{class:"match-height"},{default:o(()=>[e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Basic",code:te},{default:o(()=>[ue,e(c)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Density",code:se},{default:o(()=>[de,e(n)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"12"},{default:o(()=>[e(t,{title:"Variant",code:me},{default:o(()=>[he,e(p)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Multiple",code:re},{default:o(()=>[ve,e(l)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Clearable",code:le},{default:o(()=>[ge,e(d)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Chips",code:oe},{default:o(()=>[fe,e(b)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Custom-Filter",code:ie},{default:o(()=>[_e,e(y)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Slots",code:ne},{default:o(()=>[Se,e(x)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"Async items",code:ae},{default:o(()=>[be,e(M)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"State Selector",code:ce},{default:o(()=>[Ae,e(k)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:o(()=>[e(t,{title:"validation",code:pe},{default:o(()=>[Ce,e(N)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{ta as default};
