import{a as c,b as x,V as g,d as A,c as D,e as k}from"./VList-Cb4zClaU.js";import{d as f,o as n,g as m,f as t,c as h,F as V,i as _,b as e,a2 as w,v as L,t as a,ax as W,y as P,ag as j,e as p,az as U,aA as G,ap as M,an as z,r as K,q as C,n as Q,ah as q,K as E}from"./main-BaC4daP5.js";import{V as S}from"./VAvatar-C7kH6m2U.js";import{V as J}from"./VDivider-OHXYM3-S.js";import{V as Y}from"./VBadge-BJhDYW18.js";import{V as B}from"./VListItemAction-C6LqBBHc.js";import{V as T}from"./VCheckbox-k0SP-vGV.js";import{_ as X}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import{V as r}from"./VCardText-yg2yyEKt.js";import{a as b,V as Z}from"./VRow-MD441sKt.js";import"./ssrBoot-ClC9I7WC.js";import"./VImg-DaBIesWz.js";import"./VCheckboxBtn-D5cOysU9.js";import"./VSelectionControl-CeD2QejG.js";import"./form-Bx6DrHT2.js";import"./VInput-khHNYcPy.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";/* empty css              */const ee=f({__name:"DemoListShaped",setup(v){const l=[{text:"Cupcake sesame snaps dessert marzipan.",icon:"bx-bxl-instagram"},{text:"Jelly beans jelly-o gummi bears chupa chups marshmallow.",icon:"bx-bxl-facebook"},{text:"Bonbon macaroon gummies pie jelly",icon:"bx-bxl-twitter"}];return(o,d)=>(n(),m(g,null,{default:t(()=>[(n(),h(V,null,_(l,(i,s)=>e(c,{key:s,value:i.text,rounded:"shaped"},{prepend:t(()=>[e(w,{icon:i.icon},null,8,["icon"])]),default:t(()=>[e(x,{textContent:L(i.text)},null,8,["textContent"])]),_:2},1032,["value"])),64))]),_:1}))}}),te=f({__name:"DemoListProgressList",setup(v){const l=[{avatar:"bx-bxl-react",title:"React is a JavaScript library for building user interfaces",language:"react",amount:90},{avatar:"bx-bxl-bootstrap",title:"Bootstrap is an open source toolkit",language:"bootstrap",amount:80},{avatar:"bx-bxl-vuejs",title:"Vue.js is the Progressive JavaScript Framework",language:"vue",amount:65},{avatar:"bx-bxl-angular",title:"Angular implements Functional Programming concepts",language:"angular",amount:75},{avatar:"bx-bxl-javascript",title:"JavaScript is the programming language of the Web",language:"javascript",amount:70}],o={react:"info",bootstrap:"primary",vue:"success",angular:"error",javascript:"warning"};return(d,i)=>(n(),m(g,{lines:"two",border:"",rounded:""},{default:t(()=>[(n(),h(V,null,_(l,(s,u)=>(n(),h(V,{key:s.language},[e(c,null,{prepend:t(()=>[e(S,{size:"36",rounded:"",variant:"tonal",icon:s.avatar,color:o[s.language]},null,8,["icon","color"])]),default:t(()=>[e(x,null,{default:t(()=>[a(L(s.title),1)]),_:2},1024),e(A,{class:"mt-2"},{default:t(()=>[e(W,{height:"6",rounded:"","rounded-bar":"","model-value":s.amount,color:o[s.language]},null,8,["model-value","color"])]),_:2},1024)]),_:2},1024),u!==l.length-1?(n(),m(J,{key:0})):P("",!0)],64))),64))]),_:1}))}}),ae={class:"ms-4"},se={class:"text-xs text-disabled"},ie=f({__name:"DemoListUserList",setup(v){const l=[{avatar:U,name:"Caroline Black",status:"Online",lastVisited:"13 minutes ago"},{avatar:G,name:"Alfred Copeland",status:"Away",lastVisited:"11 minutes ago"},{avatar:M,name:"Celia Schneider",status:"Offline",lastVisited:"9 minutes ago"},{avatar:z,name:"Max Rogan",status:"In Meeting",lastVisited:"28 minutes ago"}],o={Online:"success",Away:"warning",Offline:"secondary","In Meeting":"error"};return(d,i)=>(n(),m(g,{lines:"two",border:"",rounded:""},{default:t(()=>[(n(),h(V,null,_(l,(s,u)=>(n(),h(V,{key:s.name},[e(c,null,{prepend:t(()=>[e(S,{image:s.avatar},null,8,["image"])]),append:t(()=>[e(j,{size:"small"},{default:t(()=>[a(" Add ")]),_:1})]),default:t(()=>[e(x,null,{default:t(()=>[a(L(s.name),1)]),_:2},1024),e(A,{class:"mt-1"},{default:t(()=>[e(Y,{dot:"",location:"start center","offset-x":"2",color:o[s.status],class:"me-3"},{default:t(()=>[p("span",ae,L(s.status),1)]),_:2},1032,["color"]),p("span",se,L(s.lastVisited),1)]),_:2},1024)]),_:2},1024),u!==l.length-1?(n(),m(J,{key:0})):P("",!0)],64))),64))]),_:1}))}}),le=["innerHTML"],ne=f({__name:"DemoListThreeLine",setup(v){const l=[{type:"subheader",title:"Today"},{prependAvatar:U,title:"Brunch this weekend?",subtitle:`<span class="text-primary">Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`},{type:"divider",inset:!0},{prependAvatar:G,title:"Summer BBQ",subtitle:`<span class="text-primary">to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.`},{type:"divider",inset:!0},{prependAvatar:M,title:"Oui oui",subtitle:'<span class="text-primary">Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?'},{type:"divider",inset:!0},{prependAvatar:z,title:"Birthday gift",subtitle:'<span class="text-primary">Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?'}];return(o,d)=>(n(),m(g,{lines:"three",items:l,"item-props":""},{subtitle:t(({subtitle:i})=>[p("div",{innerHTML:i},null,8,le)]),_:1}))}}),oe=f({__name:"DemoListTwoLinesAndSubheader",setup(v){const l=[{color:"blue",icon:"bx-home-alt-2",subtitle:"Jan 20, 2014",title:"Vacation itinerary"},{color:"amber",icon:"bx-camera-home",subtitle:"Jan 10, 2014",title:"Kitchen remodel"}],o=[{subtitle:"Jan 9, 2014",title:"Photos"},{subtitle:"Jan 17, 2014",title:"Recipes"},{subtitle:"Jan 28, 2014",title:"Work"}];return(d,i)=>(n(),m(g,{lines:"two"},{default:t(()=>[e(D,{inset:""},{default:t(()=>[a(" Folders ")]),_:1}),(n(),h(V,null,_(o,s=>e(c,{key:s.title,title:s.title,subtitle:s.subtitle},{prepend:t(()=>[e(S,{color:"secondary",variant:"tonal"},{default:t(()=>[e(w,{size:22,icon:"bx-folder"})]),_:1})]),append:t(()=>[e(j,{variant:"text",color:"default",icon:"bx-info-circle"})]),_:2},1032,["title","subtitle"])),64)),e(J,{inset:""}),e(D,{inset:""},{default:t(()=>[a(" Files ")]),_:1}),(n(),h(V,null,_(l,s=>e(c,{key:s.title,title:s.title,subtitle:s.subtitle},{prepend:t(()=>[e(S,{color:"secondary",variant:"tonal"},{default:t(()=>[e(w,{size:22,icon:s.icon},null,8,["icon"])]),_:2},1024)]),append:t(()=>[e(j,{variant:"text",color:"default",icon:"bx-info-circle"})]),_:2},1032,["title","subtitle"])),64))]),_:1}))}}),re=f({__name:"DemoListSubGroup",setup(v){const l=K(["Users","Admin"]),o=[["Management","bx-user"],["Settings","bx-cog"]],d=[["Create","bx-plus"],["Read","bx-file"],["Update","bx-refresh"],["Delete","bx-trash"]];return(i,s)=>(n(),m(g,{opened:Q(l),"onUpdate:opened":s[0]||(s[0]=u=>q(l)?l.value=u:null)},{default:t(()=>[e(c,{"prepend-icon":"bx-home",title:"Home",value:"Home"}),e(k,{value:"Users"},{activator:t(({props:u})=>[e(c,C(u,{"prepend-icon":"bx-user",title:"Users"}),null,16)]),default:t(()=>[e(k,{value:"Admin"},{activator:t(({props:u})=>[e(c,C(u,{title:"Admin"}),null,16)]),default:t(()=>[(n(),h(V,null,_(o,([u,y],I)=>e(c,{key:I,value:u,title:u,"prepend-icon":y},null,8,["value","title","prepend-icon"])),64))]),_:1}),e(k,{value:"Actions"},{activator:t(({props:u})=>[e(c,C(u,{title:"Actions"}),null,16)]),default:t(()=>[(n(),h(V,null,_(d,([u,y],I)=>e(c,{key:I,value:u,title:u,"prepend-icon":y},null,8,["value","title","prepend-icon"])),64))]),_:1})]),_:1})]),_:1},8,["opened"]))}}),ue={};function pe(v,l){return n(),m(g,{lines:"three","select-strategy":"classic"},{default:t(()=>[e(D,null,{default:t(()=>[a("General")]),_:1}),e(c,{value:"notifications"},{prepend:t(({isActive:o})=>[e(B,null,{default:t(()=>[e(T,{"model-value":o,color:"primary",class:"mt-2"},null,8,["model-value"])]),_:2},1024)]),default:t(()=>[e(x,null,{default:t(()=>[a("Notifications")]),_:1}),e(A,null,{default:t(()=>[a("Notify me about updates to apps or games that I downloaded")]),_:1})]),_:1}),e(c,{value:"sound"},{prepend:t(({isActive:o})=>[e(B,null,{default:t(()=>[e(T,{"model-value":o,color:"primary",class:"mt-2"},null,8,["model-value"])]),_:2},1024)]),default:t(()=>[e(x,null,{default:t(()=>[a("Sound")]),_:1}),e(A,null,{default:t(()=>[a("Auto-update apps at any time. Data charges may apply")]),_:1})]),_:1}),e(c,{value:"widgets"},{prepend:t(({isActive:o})=>[e(B,null,{default:t(()=>[e(T,{"model-value":o,color:"primary",class:"mt-2"},null,8,["model-value"])]),_:2},1024)]),default:t(()=>[e(x,null,{default:t(()=>[a("Auto-add widgets")]),_:1}),e(A,null,{default:t(()=>[a("Automatically add home screen widgets when downloads complete")]),_:1})]),_:1})]),_:1})}const ce=E(ue,[["render",pe]]),me=f({__name:"DemoListNav",setup(v){const l=[{title:"My Files",value:1,prependIcon:"bx-folder"},{title:"Shared with me",value:2,prependIcon:"bx-user"},{title:"Starred",value:3,prependIcon:"bx-star"},{title:"Recent",value:4,prependIcon:"bx-history"},{title:"Offline",value:5,prependIcon:"bx-check-circle"},{title:"Uploads",value:6,prependIcon:"bx-upload"},{title:"Backups",value:7,prependIcon:"bx-cloud-upload"}];return(o,d)=>(n(),m(g,{nav:"",lines:!1},{default:t(()=>[(n(),h(V,null,_(l,i=>e(c,{key:i.value,value:i.value},{prepend:t(()=>[e(w,{icon:i.prependIcon},null,8,["icon"])]),default:t(()=>[e(x,null,{default:t(()=>[a(L(i.title),1)]),_:2},1024)]),_:2},1032,["value"])),64))]),_:1}))}}),de=f({__name:"DemoListDensity",setup(v){const l=[{title:"halvah icing marshmallow",value:1},{title:"Cake caramels donut danish muffin biscuit",value:2},{title:"Chocolate cake pie lollipop",value:3},{title:"Apple pie toffee pudding gummi bears",value:4},{title:"Jujubes chupa chups cheesecake tart",value:5},{title:"Candy fruitcake bonbon sesame snaps dessert",value:6},{title:"Candy wafer tiramisu sugar plum sweet.",value:7},{title:"Toffee gingerbread muffin macaroon cotton candy bonbon lollipop.",value:8}];return(o,d)=>(n(),m(g,{density:"comfortable",items:l}))}}),ve=f({__name:"DemoListRounded",setup(v){const l=[{title:"Cupcake sesame snaps dessert marzipan.",value:1,props:{prependIcon:"bx-bxl-instagram",rounded:"xl"}},{title:"Jelly beans jelly-o gummi bears chupa chups marshmallow.",value:2,props:{prependIcon:"bx-bxl-facebook",rounded:"xl"}},{title:"Bonbon macaroon gummies pie jelly",value:3,props:{prependIcon:"bx-bxl-whatsapp",rounded:"xl"}},{title:"halvah icing marshmallow",value:4,props:{prependIcon:"bx-bxl-twitter",rounded:"xl"}}];return(o,d)=>(n(),m(g,{items:l}))}}),be=f({__name:"DemoListBasic",setup(v){const l=["Cras justo odio","Dapibus ac facilisis in","Morbi leo risus","Porta ac consectetur ac"];return(o,d)=>(n(),m(g,{items:l}))}}),ge={ts:`<template>
  <VList
    lines="three"
    select-strategy="classic"
  >
    <VListSubheader>General</VListSubheader>

    <VListItem value="notifications">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Notifications</VListItemTitle>
      <VListItemSubtitle>Notify me about updates to apps or games that I downloaded</VListItemSubtitle>
    </VListItem>

    <VListItem value="sound">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Sound</VListItemTitle>
      <VListItemSubtitle>Auto-update apps at any time. Data charges may apply</VListItemSubtitle>
    </VListItem>

    <VListItem value="widgets">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Auto-add widgets</VListItemTitle>
      <VListItemSubtitle>Automatically add home screen widgets when downloads complete</VListItemSubtitle>
    </VListItem>
  </VList>
</template>
`,js:`<template>
  <VList
    lines="three"
    select-strategy="classic"
  >
    <VListSubheader>General</VListSubheader>

    <VListItem value="notifications">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Notifications</VListItemTitle>
      <VListItemSubtitle>Notify me about updates to apps or games that I downloaded</VListItemSubtitle>
    </VListItem>

    <VListItem value="sound">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Sound</VListItemTitle>
      <VListItemSubtitle>Auto-update apps at any time. Data charges may apply</VListItemSubtitle>
    </VListItem>

    <VListItem value="widgets">
      <template #prepend="{ isActive }">
        <VListItemAction>
          <VCheckbox
            :model-value="isActive"
            color="primary"
            class="mt-2"
          />
        </VListItemAction>
      </template>

      <VListItemTitle>Auto-add widgets</VListItemTitle>
      <VListItemSubtitle>Automatically add home screen widgets when downloads complete</VListItemSubtitle>
    </VListItem>
  </VList>
</template>
`},fe={ts:`<script setup lang="ts">
const items = ['Cras justo odio', 'Dapibus ac facilisis in', 'Morbi leo risus', 'Porta ac consectetur ac']
<\/script>

<template>
  <VList :items="items" />
</template>
`,js:`<script setup>
const items = [
  'Cras justo odio',
  'Dapibus ac facilisis in',
  'Morbi leo risus',
  'Porta ac consectetur ac',
]
<\/script>

<template>
  <VList :items="items" />
</template>
`},he={ts:`<script lang="ts" setup>
const items = [
  { title: 'halvah icing marshmallow', value: 1 },
  { title: 'Cake caramels donut danish muffin biscuit', value: 2 },
  { title: 'Chocolate cake pie lollipop', value: 3 },
  { title: 'Apple pie toffee pudding gummi bears', value: 4 },
  { title: 'Jujubes chupa chups cheesecake tart', value: 5 },
  { title: 'Candy fruitcake bonbon sesame snaps dessert', value: 6 },
  { title: 'Candy wafer tiramisu sugar plum sweet.', value: 7 },
  { title: 'Toffee gingerbread muffin macaroon cotton candy bonbon lollipop.', value: 8 },
]
<\/script>

<template>
  <VList
    density="comfortable"
    :items="items"
  />
</template>
`,js:`<script setup>
const items = [
  {
    title: 'halvah icing marshmallow',
    value: 1,
  },
  {
    title: 'Cake caramels donut danish muffin biscuit',
    value: 2,
  },
  {
    title: 'Chocolate cake pie lollipop',
    value: 3,
  },
  {
    title: 'Apple pie toffee pudding gummi bears',
    value: 4,
  },
  {
    title: 'Jujubes chupa chups cheesecake tart',
    value: 5,
  },
  {
    title: 'Candy fruitcake bonbon sesame snaps dessert',
    value: 6,
  },
  {
    title: 'Candy wafer tiramisu sugar plum sweet.',
    value: 7,
  },
  {
    title: 'Toffee gingerbread muffin macaroon cotton candy bonbon lollipop.',
    value: 8,
  },
]
<\/script>

<template>
  <VList
    density="comfortable"
    :items="items"
  />
</template>
`},Ve={ts:`<script lang="ts" setup>
const items = [
  { title: 'My Files', value: 1, prependIcon: 'bx-folder' },
  { title: 'Shared with me', value: 2, prependIcon: 'bx-user' },
  { title: 'Starred', value: 3, prependIcon: 'bx-star' },
  { title: 'Recent', value: 4, prependIcon: 'bx-history' },
  { title: 'Offline', value: 5, prependIcon: 'bx-check-circle' },
  { title: 'Uploads', value: 6, prependIcon: 'bx-upload' },
  { title: 'Backups', value: 7, prependIcon: 'bx-cloud-upload' },
]
<\/script>

<template>
  <VList
    nav
    :lines="false"
  >
    <VListItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
    >
      <template #prepend>
        <VIcon :icon="item.prependIcon" />
      </template>

      <VListItemTitle>
        {{ item.title }}
      </VListItemTitle>
    </VListItem>
  </VList>
</template>
`,js:`<script setup>
const items = [
  {
    title: 'My Files',
    value: 1,
    prependIcon: 'bx-folder',
  },
  {
    title: 'Shared with me',
    value: 2,
    prependIcon: 'bx-user',
  },
  {
    title: 'Starred',
    value: 3,
    prependIcon: 'bx-star',
  },
  {
    title: 'Recent',
    value: 4,
    prependIcon: 'bx-history',
  },
  {
    title: 'Offline',
    value: 5,
    prependIcon: 'bx-check-circle',
  },
  {
    title: 'Uploads',
    value: 6,
    prependIcon: 'bx-upload',
  },
  {
    title: 'Backups',
    value: 7,
    prependIcon: 'bx-cloud-upload',
  },
]
<\/script>

<template>
  <VList
    nav
    :lines="false"
  >
    <VListItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
    >
      <template #prepend>
        <VIcon :icon="item.prependIcon" />
      </template>

      <VListItemTitle>
        {{ item.title }}
      </VListItemTitle>
    </VListItem>
  </VList>
</template>
`},_e={ts:`<script setup lang="ts">
interface Language {
  'react': string
  'bootstrap': string
  'vue': string
  'angular': string
  'javascript': string
}

interface Progress {
  avatar: string
  title: string
  language: keyof Language
  amount: number
}

const languageProgress: Progress[] = [
  {
    avatar: 'bx-bxl-react',
    title: 'React is a JavaScript library for building user interfaces',
    language: 'react',
    amount: 90,
  },
  {
    avatar: 'bx-bxl-bootstrap',
    title: 'Bootstrap is an open source toolkit',
    language: 'bootstrap',
    amount: 80,
  },
  {
    avatar: 'bx-bxl-vuejs',
    title: 'Vue.js is the Progressive JavaScript Framework',
    language: 'vue',
    amount: 65,
  },
  {
    avatar: 'bx-bxl-angular',
    title: 'Angular implements Functional Programming concepts',
    language: 'angular',
    amount: 75,
  },
  {
    avatar: 'bx-bxl-javascript',
    title: 'JavaScript is the programming language of the Web',
    language: 'javascript',
    amount: 70,
  },
]

const resolveStatusColor: Language = {
  react: 'info',
  bootstrap: 'primary',
  vue: 'success',
  angular: 'error',
  javascript: 'warning',
}
<\/script>

<template>
  <VList
    lines="two"
    border
    rounded
  >
    <template
      v-for="(progress, index) of languageProgress"
      :key="progress.language"
    >
      <VListItem>
        <template #prepend>
          <VAvatar
            size="36"
            rounded
            variant="tonal"
            :icon="progress.avatar"
            :color="resolveStatusColor[progress.language]"
          />
        </template>

        <VListItemTitle>
          {{ progress.title }}
        </VListItemTitle>

        <VListItemSubtitle class="mt-2">
          <VProgressLinear
            height="6"
            rounded
            rounded-bar
            :model-value="progress.amount"
            :color="resolveStatusColor[progress.language]"
          />
        </VListItemSubtitle>
      </VListItem>

      <VDivider v-if="index !== languageProgress.length - 1" />
    </template>
  </VList>
</template>
`,js:`<script setup>
const languageProgress = [
  {
    avatar: 'bx-bxl-react',
    title: 'React is a JavaScript library for building user interfaces',
    language: 'react',
    amount: 90,
  },
  {
    avatar: 'bx-bxl-bootstrap',
    title: 'Bootstrap is an open source toolkit',
    language: 'bootstrap',
    amount: 80,
  },
  {
    avatar: 'bx-bxl-vuejs',
    title: 'Vue.js is the Progressive JavaScript Framework',
    language: 'vue',
    amount: 65,
  },
  {
    avatar: 'bx-bxl-angular',
    title: 'Angular implements Functional Programming concepts',
    language: 'angular',
    amount: 75,
  },
  {
    avatar: 'bx-bxl-javascript',
    title: 'JavaScript is the programming language of the Web',
    language: 'javascript',
    amount: 70,
  },
]

const resolveStatusColor = {
  react: 'info',
  bootstrap: 'primary',
  vue: 'success',
  angular: 'error',
  javascript: 'warning',
}
<\/script>

<template>
  <VList
    lines="two"
    border
    rounded
  >
    <template
      v-for="(progress, index) of languageProgress"
      :key="progress.language"
    >
      <VListItem>
        <template #prepend>
          <VAvatar
            size="36"
            rounded
            variant="tonal"
            :icon="progress.avatar"
            :color="resolveStatusColor[progress.language]"
          />
        </template>

        <VListItemTitle>
          {{ progress.title }}
        </VListItemTitle>

        <VListItemSubtitle class="mt-2">
          <VProgressLinear
            height="6"
            rounded
            rounded-bar
            :model-value="progress.amount"
            :color="resolveStatusColor[progress.language]"
          />
        </VListItemSubtitle>
      </VListItem>

      <VDivider v-if="index !== languageProgress.length - 1" />
    </template>
  </VList>
</template>
`},xe={ts:`<script lang="ts" setup>
const items = [
  {
    title: 'Cupcake sesame snaps dessert marzipan.',
    value: 1,
    props: {
      prependIcon: 'bx-bxl-instagram',
      rounded: 'xl',
    },
  },
  {
    title: 'Jelly beans jelly-o gummi bears chupa chups marshmallow.',
    value: 2,
    props: {
      prependIcon: 'bx-bxl-facebook',
      rounded: 'xl',
    },
  },
  {
    title: 'Bonbon macaroon gummies pie jelly',
    value: 3,
    props: {
      prependIcon: 'bx-bxl-whatsapp',
      rounded: 'xl',
    },
  },
  {
    title: 'halvah icing marshmallow',
    value: 4,
    props: {
      prependIcon: 'bx-bxl-twitter',
      rounded: 'xl',
    },
  },
]
<\/script>

<template>
  <VList :items="items" />
</template>
`,js:`<script setup>
const items = [
  {
    title: 'Cupcake sesame snaps dessert marzipan.',
    value: 1,
    props: {
      prependIcon: 'bx-bxl-instagram',
      rounded: 'xl',
    },
  },
  {
    title: 'Jelly beans jelly-o gummi bears chupa chups marshmallow.',
    value: 2,
    props: {
      prependIcon: 'bx-bxl-facebook',
      rounded: 'xl',
    },
  },
  {
    title: 'Bonbon macaroon gummies pie jelly',
    value: 3,
    props: {
      prependIcon: 'bx-bxl-whatsapp',
      rounded: 'xl',
    },
  },
  {
    title: 'halvah icing marshmallow',
    value: 4,
    props: {
      prependIcon: 'bx-bxl-twitter',
      rounded: 'xl',
    },
  },
]
<\/script>

<template>
  <VList :items="items" />
</template>
`},Le={ts:`<script lang="ts" setup>
const items = [
  { text: 'Cupcake sesame snaps dessert marzipan.', icon: 'bx-bxl-instagram' },
  { text: 'Jelly beans jelly-o gummi bears chupa chups marshmallow.', icon: 'bx-bxl-facebook' },
  { text: 'Bonbon macaroon gummies pie jelly', icon: 'bx-bxl-twitter' },
]
<\/script>

<template>
  <VList>
    <VListItem
      v-for="(item, i) in items"
      :key="i"
      :value="item.text"
      rounded="shaped"
    >
      <template #prepend>
        <VIcon :icon="item.icon" />
      </template>
      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
      <VListItemTitle v-text="item.text" />
    </VListItem>
  </VList>
</template>
`,js:`<script setup>
const items = [
  {
    text: 'Cupcake sesame snaps dessert marzipan.',
    icon: 'bx-bxl-instagram',
  },
  {
    text: 'Jelly beans jelly-o gummi bears chupa chups marshmallow.',
    icon: 'bx-bxl-facebook',
  },
  {
    text: 'Bonbon macaroon gummies pie jelly',
    icon: 'bx-bxl-twitter',
  },
]
<\/script>

<template>
  <VList>
    <VListItem
      v-for="(item, i) in items"
      :key="i"
      :value="item.text"
      rounded="shaped"
    >
      <template #prepend>
        <VIcon :icon="item.icon" />
      </template>
      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
      <VListItemTitle v-text="item.text" />
    </VListItem>
  </VList>
</template>
`},ye={ts:`<script lang="ts" setup>
const open = ref(['Users', 'Admin'])

const admins = [
  ['Management', 'bx-user'],
  ['Settings', 'bx-cog'],
]

const cruds = [
  ['Create', 'bx-plus'],
  ['Read', 'bx-file'],
  ['Update', 'bx-refresh'],
  ['Delete', 'bx-trash'],
]
<\/script>

<template>
  <VList v-model:opened="open">
    <VListItem
      prepend-icon="bx-home"
      title="Home"
      value="Home"
    />

    <VListGroup value="Users">
      <template #activator="{ props }">
        <VListItem
          v-bind="props"
          prepend-icon="bx-user"
          title="Users"
        />
      </template>

      <VListGroup value="Admin">
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            title="Admin"
          />
        </template>

        <VListItem
          v-for="([title, icon], i) in admins"
          :key="i"
          :value="title"
          :title="title"
          :prepend-icon="icon"
        />
      </VListGroup>

      <VListGroup value="Actions">
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            title="Actions"
          />
        </template>

        <VListItem
          v-for="([title, icon], i) in cruds"
          :key="i"
          :value="title"
          :title="title"
          :prepend-icon="icon"
        />
      </VListGroup>
    </VListGroup>
  </VList>
</template>
`,js:`<script setup>
const open = ref([
  'Users',
  'Admin',
])

const admins = [
  [
    'Management',
    'bx-user',
  ],
  [
    'Settings',
    'bx-cog',
  ],
]

const cruds = [
  [
    'Create',
    'bx-plus',
  ],
  [
    'Read',
    'bx-file',
  ],
  [
    'Update',
    'bx-refresh',
  ],
  [
    'Delete',
    'bx-trash',
  ],
]
<\/script>

<template>
  <VList v-model:opened="open">
    <VListItem
      prepend-icon="bx-home"
      title="Home"
      value="Home"
    />

    <VListGroup value="Users">
      <template #activator="{ props }">
        <VListItem
          v-bind="props"
          prepend-icon="bx-user"
          title="Users"
        />
      </template>

      <VListGroup value="Admin">
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            title="Admin"
          />
        </template>

        <VListItem
          v-for="([title, icon], i) in admins"
          :key="i"
          :value="title"
          :title="title"
          :prepend-icon="icon"
        />
      </VListGroup>

      <VListGroup value="Actions">
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            title="Actions"
          />
        </template>

        <VListItem
          v-for="([title, icon], i) in cruds"
          :key="i"
          :value="title"
          :title="title"
          :prepend-icon="icon"
        />
      </VListGroup>
    </VListGroup>
  </VList>
</template>
`},Ie={ts:`<script lang="ts" setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'

const items = [
  { type: 'subheader', title: 'Today' },
  {
    prependAvatar: avatar1,
    title: 'Brunch this weekend?',
    subtitle: '<span class="text-primary">Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?',
  },
  { type: 'divider', inset: true },
  {
    prependAvatar: avatar2,
    title: 'Summer BBQ',
    subtitle: '<span class="text-primary">to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.',
  },
  { type: 'divider', inset: true },
  {
    prependAvatar: avatar3,
    title: 'Oui oui',
    subtitle: '<span class="text-primary">Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?',
  },
  { type: 'divider', inset: true },
  {
    prependAvatar: avatar4,
    title: 'Birthday gift',
    subtitle: '<span class="text-primary">Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?',
  },
]
<\/script>

<template>
  <VList
    lines="three"
    :items="items"
    item-props
  >
    <template #subtitle="{ subtitle }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="subtitle" />
    </template>
  </VList>
</template>
`,js:`<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'

const items = [
  {
    type: 'subheader',
    title: 'Today',
  },
  {
    prependAvatar: avatar1,
    title: 'Brunch this weekend?',
    subtitle: '<span class="text-primary">Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?',
  },
  {
    type: 'divider',
    inset: true,
  },
  {
    prependAvatar: avatar2,
    title: 'Summer BBQ',
    subtitle: '<span class="text-primary">to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.',
  },
  {
    type: 'divider',
    inset: true,
  },
  {
    prependAvatar: avatar3,
    title: 'Oui oui',
    subtitle: '<span class="text-primary">Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?',
  },
  {
    type: 'divider',
    inset: true,
  },
  {
    prependAvatar: avatar4,
    title: 'Birthday gift',
    subtitle: '<span class="text-primary">Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?',
  },
]
<\/script>

<template>
  <VList
    lines="three"
    :items="items"
    item-props
  >
    <template #subtitle="{ subtitle }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="subtitle" />
    </template>
  </VList>
</template>
`},Ae={ts:`<script lang="ts" setup>
const files = [
  {
    color: 'blue',
    icon: 'bx-home-alt-2',
    subtitle: 'Jan 20, 2014',
    title: 'Vacation itinerary',
  },
  {
    color: 'amber',
    icon: 'bx-camera-home',
    subtitle: 'Jan 10, 2014',
    title: 'Kitchen remodel',
  },
]

const folders = [
  {
    subtitle: 'Jan 9, 2014',
    title: 'Photos',
  },
  {
    subtitle: 'Jan 17, 2014',
    title: 'Recipes',
  },
  {
    subtitle: 'Jan 28, 2014',
    title: 'Work',
  },
]
<\/script>

<template>
  <VList lines="two">
    <VListSubheader inset>
      Folders
    </VListSubheader>

    <VListItem
      v-for="folder in folders"
      :key="folder.title"
      :title="folder.title"
      :subtitle="folder.subtitle"
    >
      <template #prepend>
        <VAvatar
          color="secondary"
          variant="tonal"
        >
          <VIcon
            :size="22"
            icon="bx-folder"
          />
        </VAvatar>
      </template>

      <template #append>
        <VBtn
          variant="text"
          color="default"
          icon="bx-info-circle"
        />
      </template>
    </VListItem>

    <VDivider inset />

    <VListSubheader inset>
      Files
    </VListSubheader>

    <VListItem
      v-for="file in files"
      :key="file.title"
      :title="file.title"
      :subtitle="file.subtitle"
    >
      <template #prepend>
        <VAvatar
          color="secondary"
          variant="tonal"
        >
          <VIcon
            :size="22"
            :icon="file.icon"
          />
        </VAvatar>
      </template>

      <template #append>
        <VBtn
          variant="text"
          color="default"
          icon="bx-info-circle"
        />
      </template>
    </VListItem>
  </VList>
</template>
`,js:`<script setup>
const files = [
  {
    color: 'blue',
    icon: 'bx-home-alt-2',
    subtitle: 'Jan 20, 2014',
    title: 'Vacation itinerary',
  },
  {
    color: 'amber',
    icon: 'bx-camera-home',
    subtitle: 'Jan 10, 2014',
    title: 'Kitchen remodel',
  },
]

const folders = [
  {
    subtitle: 'Jan 9, 2014',
    title: 'Photos',
  },
  {
    subtitle: 'Jan 17, 2014',
    title: 'Recipes',
  },
  {
    subtitle: 'Jan 28, 2014',
    title: 'Work',
  },
]
<\/script>

<template>
  <VList lines="two">
    <VListSubheader inset>
      Folders
    </VListSubheader>

    <VListItem
      v-for="folder in folders"
      :key="folder.title"
      :title="folder.title"
      :subtitle="folder.subtitle"
    >
      <template #prepend>
        <VAvatar
          color="secondary"
          variant="tonal"
        >
          <VIcon
            :size="22"
            icon="bx-folder"
          />
        </VAvatar>
      </template>

      <template #append>
        <VBtn
          variant="text"
          color="default"
          icon="bx-info-circle"
        />
      </template>
    </VListItem>

    <VDivider inset />

    <VListSubheader inset>
      Files
    </VListSubheader>

    <VListItem
      v-for="file in files"
      :key="file.title"
      :title="file.title"
      :subtitle="file.subtitle"
    >
      <template #prepend>
        <VAvatar
          color="secondary"
          variant="tonal"
        >
          <VIcon
            :size="22"
            :icon="file.icon"
          />
        </VAvatar>
      </template>

      <template #append>
        <VBtn
          variant="text"
          color="default"
          icon="bx-info-circle"
        />
      </template>
    </VListItem>
  </VList>
</template>
`},we={ts:`<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'

interface Status {
  'Online': string
  'Away': string
  'Offline': string
  'In Meeting': string
}

interface Users {
  avatar: string
  name: string
  status: keyof Status
  lastVisited: string
}

const users: Users[] = [
  {
    avatar: avatar1,
    name: 'Caroline Black',
    status: 'Online',
    lastVisited: '13 minutes ago',
  },
  {
    avatar: avatar2,
    name: 'Alfred Copeland',
    status: 'Away',
    lastVisited: '11 minutes ago',
  },
  {
    avatar: avatar3,
    name: 'Celia Schneider',
    status: 'Offline',
    lastVisited: '9 minutes ago',
  },
  {
    avatar: avatar4,
    name: 'Max Rogan',
    status: 'In Meeting',
    lastVisited: '28 minutes ago',
  },
]

const resolveStatusColor: Status = {
  'Online': 'success',
  'Away': 'warning',
  'Offline': 'secondary',
  'In Meeting': 'error',
}
<\/script>

<template>
  <VList
    lines="two"
    border
    rounded
  >
    <template
      v-for="(user, index) of users"
      :key="user.name"
    >
      <VListItem>
        <template #prepend>
          <VAvatar :image="user.avatar" />
        </template>
        <VListItemTitle>
          {{ user.name }}
        </VListItemTitle>
        <VListItemSubtitle class="mt-1">
          <VBadge
            dot
            location="start center"
            offset-x="2"
            :color="resolveStatusColor[user.status]"
            class="me-3"
          >
            <span class="ms-4">{{ user.status }}</span>
          </VBadge>

          <span class="text-xs text-disabled">{{ user.lastVisited }}</span>
        </VListItemSubtitle>

        <template #append>
          <VBtn size="small">
            Add
          </VBtn>
        </template>
      </VListItem>
      <VDivider v-if="index !== users.length - 1" />
    </template>
  </VList>
</template>
`,js:`<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'

const users = [
  {
    avatar: avatar1,
    name: 'Caroline Black',
    status: 'Online',
    lastVisited: '13 minutes ago',
  },
  {
    avatar: avatar2,
    name: 'Alfred Copeland',
    status: 'Away',
    lastVisited: '11 minutes ago',
  },
  {
    avatar: avatar3,
    name: 'Celia Schneider',
    status: 'Offline',
    lastVisited: '9 minutes ago',
  },
  {
    avatar: avatar4,
    name: 'Max Rogan',
    status: 'In Meeting',
    lastVisited: '28 minutes ago',
  },
]

const resolveStatusColor = {
  'Online': 'success',
  'Away': 'warning',
  'Offline': 'secondary',
  'In Meeting': 'error',
}
<\/script>

<template>
  <VList
    lines="two"
    border
    rounded
  >
    <template
      v-for="(user, index) of users"
      :key="user.name"
    >
      <VListItem>
        <template #prepend>
          <VAvatar :image="user.avatar" />
        </template>
        <VListItemTitle>
          {{ user.name }}
        </VListItemTitle>
        <VListItemSubtitle class="mt-1">
          <VBadge
            dot
            location="start center"
            offset-x="2"
            :color="resolveStatusColor[user.status]"
            class="me-3"
          >
            <span class="ms-4">{{ user.status }}</span>
          </VBadge>

          <span class="text-xs text-disabled">{{ user.lastVisited }}</span>
        </VListItemSubtitle>

        <template #append>
          <VBtn size="small">
            Add
          </VBtn>
        </template>
      </VListItem>
      <VDivider v-if="index !== users.length - 1" />
    </template>
  </VList>
</template>
`},Se=p("code",null,"v-list",-1),ke=p("code",null,"v-list-item",-1),Ce=p("code",null,"rounded",-1),Be=p("code",null,"density",-1),Te=p("code",null,"default",-1),De=p("code",null,"comfortable",-1),je=p("code",null,"compact",-1),Je=p("code",null,"nav",-1),Pe=p("code",null,"v-list-item",-1),Ue=p("code",null,"three-line",-1),Ge=p("code",null,"v-list-group",-1),Me=p("code",null,"v-list-group",-1),ze=p("code",null,"v-list-item",-1),lt=f({__name:"list",setup(v){return(l,o)=>{const d=be,i=X,s=ve,u=de,y=me,I=ce,H=re,O=oe,R=ne,F=ie,$=te,N=ee;return n(),m(Z,{class:"match-height"},{default:t(()=>[e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Basic","no-padding":"",code:fe},{default:t(()=>[e(r,null,{default:t(()=>[Se,a(" component can contain an avatar, content, actions and much more.")]),_:1}),e(r,null,{default:t(()=>[e(d)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Rounded","no-padding":"",code:xe},{default:t(()=>[e(r,null,{default:t(()=>[a("You can make "),ke,a(" rounded using "),Ce,a(" prop.")]),_:1}),e(r,null,{default:t(()=>[e(s)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Density",code:he,"no-padding":""},{default:t(()=>[e(r,null,{default:t(()=>[a("Use "),Be,a(" prop to adjusts the spacing within the component. Available options are: "),Te,a(", "),De,a(", and "),je,a(".")]),_:1}),e(r,null,{default:t(()=>[e(u)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Nav","no-padding":"",code:Ve},{default:t(()=>[e(r,null,{default:t(()=>[a("Lists can receive an alternative "),Je,a(" styling that reduces the width "),Pe,a(" takes up as well as adding a border radius.")]),_:1}),e(r,null,{default:t(()=>[e(y)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Action and item group","no-padding":"",code:ge},{default:t(()=>[e(r,null,{default:t(()=>[a("A "),Ue,a(" list with actions. Utilizing "),Ge,a(", easily connect actions to your tiles.")]),_:1}),e(r,null,{default:t(()=>[e(I)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Sub Group","no-padding":"",code:ye},{default:t(()=>[e(r,null,{default:t(()=>[a(" Using the "),Me,a(" component you can create up to 2 levels in depth using the sub-group prop. ")]),_:1}),e(r,null,{default:t(()=>[e(H)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Two lines and subheader","no-padding":"",code:Ae},{default:t(()=>[e(r,null,{default:t(()=>[a("Lists can contain subheaders, dividers, and can contain 1 or more lines. The subtitle will overflow with ellipsis if it extends past one line.")]),_:1}),e(r,null,{default:t(()=>[e(O)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Three Line","no-padding":"",code:Ie},{default:t(()=>[e(r,null,{default:t(()=>[a("For three line lists, the subtitle will clamp vertically at 2 lines and then ellipsis. This feature uses line-clamp and is not supported in all browsers.")]),_:1}),e(r,null,{default:t(()=>[e(R)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"User List","no-padding":"",code:we},{default:t(()=>[e(r,null,{default:t(()=>[e(F)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Progress List","no-padding":"",code:_e},{default:t(()=>[e(r,null,{default:t(()=>[e($)]),_:1})]),_:1},8,["code"])]),_:1}),e(b,{cols:"12",md:"6"},{default:t(()=>[e(i,{title:"Shaped","no-padding":"",code:Le},{default:t(()=>[e(r,null,{default:t(()=>[a(" Shaped lists have rounded borders on one side of the "),ze,a(". ")]),_:1}),e(r,null,{default:t(()=>[e(N)]),_:1})]),_:1},8,["code"])]),_:1})]),_:1})}}});export{lt as default};
