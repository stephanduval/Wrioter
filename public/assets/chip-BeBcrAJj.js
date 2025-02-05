import{V as o}from"./VChip-BPUxCjj5.js";import{V as W,a as w,b as z,d as L}from"./VList-P5iFN8Pn.js";import{V as A}from"./VListItemAction-eHHQU0VQ.js";import{d as S,r as u,o as c,g as h,f as i,b as e,aD as M,aE as J,t as a,ag as T,a2 as f,n as s,ah as k,K as y,c as _,az as j,aA as N,ap as B,an as R,e as t,y as g}from"./main-Ca4qx7y-.js";import{V as F}from"./VMenu-BXWqdo-4.js";import{_ as U}from"./AppCombobox.vue_vue_type_script_setup_true_lang-DYWBhDvO.js";import{V as I}from"./VAvatar-B3k1LwfD.js";import{_ as Y}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import{a as m,V as O}from"./VRow-EsZ_8CZn.js";import"./VSlideGroup-DbGP5EjM.js";import"./ssrBoot-WXvDeQ_A.js";import"./VImg-C3GobFkp.js";import"./VDivider-CMgOCZ_h.js";import"./VOverlay-C-c1GQAd.js";import"./easing-CjukEv2V.js";import"./delay-DDujfhaz.js";import"./lazy-He9qliih.js";import"./scopeId-B0kCZn--.js";import"./forwardRefs-C-GTDzx5.js";import"./dialog-transition-ianbTZuP.js";import"./form-C6PetfES.js";import"./VSelect-D7uk1eqE.js";import"./VTextField-DA7n0c0j.js";/* empty css                   */import"./VCounter-DbxmW7Y4.js";import"./VField-ZOdg6ueh.js";import"./VInput-iEBwr0fp.js";import"./VCheckboxBtn-IHz41y0p.js";import"./VSelectionControl-CJpIFID9.js";import"./filter-BytWbrbk.js";import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./VCard-k3dQT3Up.js";import"./VCardText-iX3erHMv.js";/* empty css              */const K=S({__name:"DemoChipExpandable",setup(d){const r=u(!1);return(V,p)=>(c(),h(F,{modelValue:s(r),"onUpdate:modelValue":p[1]||(p[1]=l=>k(r)?r.value=l:null),transition:"scale-transition"},{activator:i(({props:l})=>[e(o,M(J(l)),{default:i(()=>[a(" VueJS ")]),_:2},1040)]),default:i(()=>[e(W,null,{default:i(()=>[e(w,null,{append:i(()=>[e(A,{class:"ms-3"},{default:i(()=>[e(T,{icon:"",variant:"text",size:"x-small",color:"default",onClick:p[0]||(p[0]=l=>r.value=!1)},{default:i(()=>[e(f,{size:"20",icon:"bx-x"})]),_:1})]),_:1})]),default:i(()=>[e(z,{class:"mb-2"},{default:i(()=>[a(" VueJS ")]),_:1}),e(L,null,{default:i(()=>[a("The Progressive JavaScript Framework")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"]))}}),q=S({__name:"DemoChipInSelects",setup(d){const r=u(["Programming","Playing games","Sleeping"]),V=u(["Streaming","Eating","Programming","Playing games","Sleeping"]);return(p,l)=>{const v=U;return c(),h(v,{modelValue:s(r),"onUpdate:modelValue":l[0]||(l[0]=b=>k(r)?r.value=b:null),chips:"",clearable:"",multiple:"","closable-chips":"","clear-icon":"bx-x-circle",items:s(V),label:"Your favorite hobbies","prepend-icon":"bx-filter-alt"},null,8,["modelValue","items"])}}}),G={},H={class:"demo-space-x"};function Q(d,r){return c(),_("div",H,[e(o,{size:"x-small"},{default:i(()=>[a(" x-small chip ")]),_:1}),e(o,{size:"small"},{default:i(()=>[a(" small chip ")]),_:1}),e(o,{size:"default"},{default:i(()=>[a(" Default ")]),_:1}),e(o,{size:"large"},{default:i(()=>[a(" large chip ")]),_:1}),e(o,{size:"x-large"},{default:i(()=>[a(" x-large chip ")]),_:1})])}const X=y(G,[["render",Q]]),Z={class:"demo-space-x"},ee=t("span",null,"John Doe",-1),ie=t("span",null,"Darcy Nooser",-1),ae=t("span",null,"Felicia Risker",-1),oe=t("span",null,"Minnie Mostly",-1),te=S({__name:"DemoChipWithAvatar",setup(d){return(r,V)=>(c(),_("div",Z,[e(o,null,{default:i(()=>[e(I,{start:"",image:s(j)},null,8,["image"]),ee]),_:1}),e(o,null,{default:i(()=>[e(I,{start:"",image:s(N)},null,8,["image"]),ie]),_:1}),e(o,{pill:"",label:!1,"prepend-avatar":s(B)},{default:i(()=>[ae]),_:1},8,["prepend-avatar"]),e(o,{pill:"",label:!1},{default:i(()=>[e(I,{start:"",image:s(R)},null,8,["image"]),oe]),_:1})]))}}),le={},se={class:"demo-space-x"};function re(d,r){return c(),_("div",se,[e(o,null,{default:i(()=>[e(f,{start:"",icon:"bx-user"}),a(" Account ")]),_:1}),e(o,{color:"primary"},{default:i(()=>[e(f,{start:"",icon:"bx-star"}),a(" Premium ")]),_:1}),e(o,{color:"secondary"},{default:i(()=>[e(f,{start:"",icon:"bx-cake"}),a(" 1 Year ")]),_:1}),e(o,{color:"success"},{default:i(()=>[e(f,{start:"",icon:"bx-bell"}),a(" Notification ")]),_:1}),e(o,{color:"info"},{default:i(()=>[e(f,{start:"",icon:"bx-message"}),a(" Message ")]),_:1}),e(o,{color:"warning"},{default:i(()=>[e(f,{start:"",icon:"bx-error"}),a(" Warning ")]),_:1}),e(o,{color:"error"},{default:i(()=>[e(f,{start:"",icon:"bx-error-circle"}),a(" Error ")]),_:1})])}const ce=y(le,[["render",re]]),ne={class:"demo-space-x"},pe=S({__name:"DemoChipClosable",setup(d){const r=u(!0),V=u(!0),p=u(!0),l=u(!0),v=u(!0),b=u(!0),x=u(!0);return(D,n)=>(c(),_("div",ne,[s(r)?(c(),h(o,{key:0,closable:"","onClick:close":n[0]||(n[0]=C=>r.value=!s(r))},{default:i(()=>[a(" Default ")]),_:1})):g("",!0),s(V)?(c(),h(o,{key:1,closable:"",color:"primary","onClick:close":n[1]||(n[1]=C=>V.value=!s(V))},{default:i(()=>[a(" Primary ")]),_:1})):g("",!0),s(p)?(c(),h(o,{key:2,closable:"",color:"secondary","onClick:close":n[2]||(n[2]=C=>p.value=!s(p))},{default:i(()=>[a(" Secondary ")]),_:1})):g("",!0),s(l)?(c(),h(o,{key:3,closable:"",color:"success","onClick:close":n[3]||(n[3]=C=>l.value=!s(l))},{default:i(()=>[a(" Success ")]),_:1})):g("",!0),s(v)?(c(),h(o,{key:4,closable:"",color:"info","onClick:close":n[4]||(n[4]=C=>v.value=!s(v))},{default:i(()=>[a(" Info ")]),_:1})):g("",!0),s(b)?(c(),h(o,{key:5,closable:"",color:"warning","onClick:close":n[5]||(n[5]=C=>b.value=!s(b))},{default:i(()=>[a(" Warning ")]),_:1})):g("",!0),s(x)?(c(),h(o,{key:6,closable:"",color:"error","onClick:close":n[6]||(n[6]=C=>x.value=!s(x))},{default:i(()=>[a(" Error ")]),_:1})):g("",!0)]))}}),de={},me={class:"demo-space-x"};function ue(d,r){return c(),_("div",me,[e(o,{label:!1},{default:i(()=>[a(" Default ")]),_:1}),e(o,{label:!1,color:"primary"},{default:i(()=>[a(" Primary ")]),_:1}),e(o,{label:!1,color:"secondary"},{default:i(()=>[a(" Secondary ")]),_:1}),e(o,{label:!1,color:"success"},{default:i(()=>[a(" Success ")]),_:1}),e(o,{label:!1,color:"info"},{default:i(()=>[a(" Info ")]),_:1}),e(o,{label:!1,color:"warning"},{default:i(()=>[a(" Warning ")]),_:1}),e(o,{label:!1,color:"error"},{default:i(()=>[a(" Error ")]),_:1})])}const he=y(de,[["render",ue]]),Ve={},Ce={class:"demo-space-x"};function fe(d,r){return c(),_("div",Ce,[e(o,{variant:"outlined"},{default:i(()=>[a(" Default ")]),_:1}),e(o,{color:"primary",variant:"outlined"},{default:i(()=>[a(" Primary ")]),_:1}),e(o,{color:"secondary",variant:"outlined"},{default:i(()=>[a(" Secondary ")]),_:1}),e(o,{color:"success",variant:"outlined"},{default:i(()=>[a(" Success ")]),_:1}),e(o,{color:"info",variant:"outlined"},{default:i(()=>[a(" Info ")]),_:1}),e(o,{color:"warning",variant:"outlined"},{default:i(()=>[a(" Warning ")]),_:1}),e(o,{color:"error",variant:"outlined"},{default:i(()=>[a(" Error ")]),_:1})])}const _e=y(Ve,[["render",fe]]),ve={},be={class:"demo-space-x"};function ge(d,r){return c(),_("div",be,[e(o,{variant:"elevated"},{default:i(()=>[a(" Default ")]),_:1}),e(o,{color:"primary",variant:"elevated"},{default:i(()=>[a(" Primary ")]),_:1}),e(o,{color:"secondary",variant:"elevated"},{default:i(()=>[a(" Secondary ")]),_:1}),e(o,{color:"success",variant:"elevated"},{default:i(()=>[a(" Success ")]),_:1}),e(o,{color:"info",variant:"elevated"},{default:i(()=>[a(" Info ")]),_:1}),e(o,{color:"warning",variant:"elevated"},{default:i(()=>[a(" Warning ")]),_:1}),e(o,{color:"error",variant:"elevated"},{default:i(()=>[a(" Error ")]),_:1})])}const ye=y(ve,[["render",ge]]),xe={},Se={class:"demo-space-x"};function Ie(d,r){return c(),_("div",Se,[e(o,null,{default:i(()=>[a(" Default ")]),_:1}),e(o,{color:"primary"},{default:i(()=>[a(" Primary ")]),_:1}),e(o,{color:"secondary"},{default:i(()=>[a(" Secondary ")]),_:1}),e(o,{color:"success"},{default:i(()=>[a(" Success ")]),_:1}),e(o,{color:"info"},{default:i(()=>[a(" Info ")]),_:1}),e(o,{color:"warning"},{default:i(()=>[a(" Warning ")]),_:1}),e(o,{color:"error"},{default:i(()=>[a(" Error ")]),_:1})])}const De=y(xe,[["render",Ie]]),ke={ts:`<script lang="ts" setup>
const isDefaultChipVisible = ref(true)
const isPrimaryChipVisible = ref(true)
const isSecondaryChipVisible = ref(true)
const isSuccessChipVisible = ref(true)
const isInfoChipVisible = ref(true)
const isWarningChipVisible = ref(true)
const isErrorChipVisible = ref(true)
<\/script>

<template>
  <div class="demo-space-x">
    <VChip
      v-if="isDefaultChipVisible"
      closable
      @click:close="isDefaultChipVisible = !isDefaultChipVisible"
    >
      Default
    </VChip>

    <VChip
      v-if="isPrimaryChipVisible"
      closable
      color="primary"
      @click:close="isPrimaryChipVisible = !isPrimaryChipVisible"
    >
      Primary
    </VChip>

    <VChip
      v-if="isSecondaryChipVisible"
      closable
      color="secondary"
      @click:close="isSecondaryChipVisible = !isSecondaryChipVisible"
    >
      Secondary
    </VChip>

    <VChip
      v-if="isSuccessChipVisible"
      closable
      color="success"
      @click:close="isSuccessChipVisible = !isSuccessChipVisible"
    >
      Success
    </VChip>

    <VChip
      v-if="isInfoChipVisible"
      closable
      color="info"
      @click:close="isInfoChipVisible = !isInfoChipVisible"
    >
      Info
    </VChip>

    <VChip
      v-if="isWarningChipVisible"
      closable
      color="warning"
      @click:close="isWarningChipVisible = !isWarningChipVisible"
    >
      Warning
    </VChip>

    <VChip
      v-if="isErrorChipVisible"
      closable
      color="error"
      @click:close="isErrorChipVisible = !isErrorChipVisible"
    >
      Error
    </VChip>
  </div>
</template>
`,js:`<script setup>
const isDefaultChipVisible = ref(true)
const isPrimaryChipVisible = ref(true)
const isSecondaryChipVisible = ref(true)
const isSuccessChipVisible = ref(true)
const isInfoChipVisible = ref(true)
const isWarningChipVisible = ref(true)
const isErrorChipVisible = ref(true)
<\/script>

<template>
  <div class="demo-space-x">
    <VChip
      v-if="isDefaultChipVisible"
      closable
      @click:close="isDefaultChipVisible = !isDefaultChipVisible"
    >
      Default
    </VChip>

    <VChip
      v-if="isPrimaryChipVisible"
      closable
      color="primary"
      @click:close="isPrimaryChipVisible = !isPrimaryChipVisible"
    >
      Primary
    </VChip>

    <VChip
      v-if="isSecondaryChipVisible"
      closable
      color="secondary"
      @click:close="isSecondaryChipVisible = !isSecondaryChipVisible"
    >
      Secondary
    </VChip>

    <VChip
      v-if="isSuccessChipVisible"
      closable
      color="success"
      @click:close="isSuccessChipVisible = !isSuccessChipVisible"
    >
      Success
    </VChip>

    <VChip
      v-if="isInfoChipVisible"
      closable
      color="info"
      @click:close="isInfoChipVisible = !isInfoChipVisible"
    >
      Info
    </VChip>

    <VChip
      v-if="isWarningChipVisible"
      closable
      color="warning"
      @click:close="isWarningChipVisible = !isWarningChipVisible"
    >
      Warning
    </VChip>

    <VChip
      v-if="isErrorChipVisible"
      closable
      color="error"
      @click:close="isErrorChipVisible = !isErrorChipVisible"
    >
      Error
    </VChip>
  </div>
</template>
`},Pe={ts:`<template>
  <div class="demo-space-x">
    <VChip>
      Default
    </VChip>

    <VChip color="primary">
      Primary
    </VChip>

    <VChip color="secondary">
      Secondary
    </VChip>

    <VChip color="success">
      Success
    </VChip>

    <VChip color="info">
      Info
    </VChip>

    <VChip color="warning">
      Warning
    </VChip>

    <VChip color="error">
      Error
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip>
      Default
    </VChip>

    <VChip color="primary">
      Primary
    </VChip>

    <VChip color="secondary">
      Secondary
    </VChip>

    <VChip color="success">
      Success
    </VChip>

    <VChip color="info">
      Info
    </VChip>

    <VChip color="warning">
      Warning
    </VChip>

    <VChip color="error">
      Error
    </VChip>
  </div>
</template>
`},Ee={ts:`<template>
  <div class="demo-space-x">
    <VChip variant="elevated">
      Default
    </VChip>

    <VChip
      color="primary"
      variant="elevated"
    >
      Primary
    </VChip>

    <VChip
      color="secondary"
      variant="elevated"
    >
      Secondary
    </VChip>

    <VChip
      color="success"
      variant="elevated"
    >
      Success
    </VChip>

    <VChip
      color="info"
      variant="elevated"
    >
      Info
    </VChip>

    <VChip
      color="warning"
      variant="elevated"
    >
      Warning
    </VChip>

    <VChip
      color="error"
      variant="elevated"
    >
      Error
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip variant="elevated">
      Default
    </VChip>

    <VChip
      color="primary"
      variant="elevated"
    >
      Primary
    </VChip>

    <VChip
      color="secondary"
      variant="elevated"
    >
      Secondary
    </VChip>

    <VChip
      color="success"
      variant="elevated"
    >
      Success
    </VChip>

    <VChip
      color="info"
      variant="elevated"
    >
      Info
    </VChip>

    <VChip
      color="warning"
      variant="elevated"
    >
      Warning
    </VChip>

    <VChip
      color="error"
      variant="elevated"
    >
      Error
    </VChip>
  </div>
</template>
`},$e={ts:`<script lang="ts" setup>
const isMenuVisible = ref(false)
<\/script>

<template>
  <VMenu
    v-model="isMenuVisible"
    transition="scale-transition"
  >
    <!-- v-menu activator -->
    <template #activator="{ props }">
      <VChip v-bind="props">
        VueJS
      </VChip>
    </template>

    <!-- v-menu list -->
    <VList>
      <VListItem>
        <VListItemTitle class="mb-2">
          VueJS
        </VListItemTitle>
        <VListItemSubtitle>The Progressive JavaScript Framework</VListItemSubtitle>

        <template #append>
          <VListItemAction class="ms-3">
            <VBtn
              icon
              variant="text"
              size="x-small"
              color="default"
              @click="isMenuVisible = false"
            >
              <VIcon
                size="20"
                icon="bx-x"
              />
            </VBtn>
          </VListItemAction>
        </template>
      </VListItem>
    </VList>
  </VMenu>
</template>
`,js:`<script setup>
const isMenuVisible = ref(false)
<\/script>

<template>
  <VMenu
    v-model="isMenuVisible"
    transition="scale-transition"
  >
    <!-- v-menu activator -->
    <template #activator="{ props }">
      <VChip v-bind="props">
        VueJS
      </VChip>
    </template>

    <!-- v-menu list -->
    <VList>
      <VListItem>
        <VListItemTitle class="mb-2">
          VueJS
        </VListItemTitle>
        <VListItemSubtitle>The Progressive JavaScript Framework</VListItemSubtitle>

        <template #append>
          <VListItemAction class="ms-3">
            <VBtn
              icon
              variant="text"
              size="x-small"
              color="default"
              @click="isMenuVisible = false"
            >
              <VIcon
                size="20"
                icon="bx-x"
              />
            </VBtn>
          </VListItemAction>
        </template>
      </VListItem>
    </VList>
  </VMenu>
</template>
`},We={ts:`<script lang="ts" setup>
const chips = ref(['Programming', 'Playing games', 'Sleeping'])
const items = ref(['Streaming', 'Eating', 'Programming', 'Playing games', 'Sleeping'])
<\/script>

<template>
  <AppCombobox
    v-model="chips"
    chips
    clearable
    multiple
    closable-chips
    clear-icon="bx-x-circle"
    :items="items"
    label="Your favorite hobbies"
    prepend-icon="bx-filter-alt"
  />
</template>
`,js:`<script setup>
const chips = ref([
  'Programming',
  'Playing games',
  'Sleeping',
])

const items = ref([
  'Streaming',
  'Eating',
  'Programming',
  'Playing games',
  'Sleeping',
])
<\/script>

<template>
  <AppCombobox
    v-model="chips"
    chips
    clearable
    multiple
    closable-chips
    clear-icon="bx-x-circle"
    :items="items"
    label="Your favorite hobbies"
    prepend-icon="bx-filter-alt"
  />
</template>
`},we={ts:`<template>
  <div class="demo-space-x">
    <VChip variant="outlined">
      Default
    </VChip>

    <VChip
      color="primary"
      variant="outlined"
    >
      Primary
    </VChip>

    <VChip
      color="secondary"
      variant="outlined"
    >
      Secondary
    </VChip>

    <VChip
      color="success"
      variant="outlined"
    >
      Success
    </VChip>

    <VChip
      color="info"
      variant="outlined"
    >
      Info
    </VChip>

    <VChip
      color="warning"
      variant="outlined"
    >
      Warning
    </VChip>

    <VChip
      color="error"
      variant="outlined"
    >
      Error
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip variant="outlined">
      Default
    </VChip>

    <VChip
      color="primary"
      variant="outlined"
    >
      Primary
    </VChip>

    <VChip
      color="secondary"
      variant="outlined"
    >
      Secondary
    </VChip>

    <VChip
      color="success"
      variant="outlined"
    >
      Success
    </VChip>

    <VChip
      color="info"
      variant="outlined"
    >
      Info
    </VChip>

    <VChip
      color="warning"
      variant="outlined"
    >
      Warning
    </VChip>

    <VChip
      color="error"
      variant="outlined"
    >
      Error
    </VChip>
  </div>
</template>
`},ze={ts:`<template>
  <div class="demo-space-x">
    <VChip :label="false">
      Default
    </VChip>

    <VChip
      :label="false"
      color="primary"
    >
      Primary
    </VChip>

    <VChip
      :label="false"
      color="secondary"
    >
      Secondary
    </VChip>

    <VChip
      :label="false"
      color="success"
    >
      Success
    </VChip>

    <VChip
      :label="false"
      color="info"
    >
      Info
    </VChip>

    <VChip
      :label="false"
      color="warning"
    >
      Warning
    </VChip>

    <VChip
      :label="false"
      color="error"
    >
      Error
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip :label="false">
      Default
    </VChip>

    <VChip
      :label="false"
      color="primary"
    >
      Primary
    </VChip>

    <VChip
      :label="false"
      color="secondary"
    >
      Secondary
    </VChip>

    <VChip
      :label="false"
      color="success"
    >
      Success
    </VChip>

    <VChip
      :label="false"
      color="info"
    >
      Info
    </VChip>

    <VChip
      :label="false"
      color="warning"
    >
      Warning
    </VChip>

    <VChip
      :label="false"
      color="error"
    >
      Error
    </VChip>
  </div>
</template>
`},Le={ts:`<template>
  <div class="demo-space-x">
    <VChip size="x-small">
      x-small chip
    </VChip>

    <VChip size="small">
      small chip
    </VChip>

    <VChip size="default">
      Default
    </VChip>

    <VChip size="large">
      large chip
    </VChip>

    <VChip size="x-large">
      x-large chip
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip size="x-small">
      x-small chip
    </VChip>

    <VChip size="small">
      small chip
    </VChip>

    <VChip size="default">
      Default
    </VChip>

    <VChip size="large">
      large chip
    </VChip>

    <VChip size="x-large">
      x-large chip
    </VChip>
  </div>
</template>
`},Ae={ts:`<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
<\/script>

<template>
  <div class="demo-space-x">
    <VChip>
      <VAvatar
        start
        :image="avatar1"
      />
      <span>John Doe</span>
    </VChip>

    <VChip>
      <VAvatar
        start
        :image="avatar2"
      />
      <span>Darcy Nooser</span>
    </VChip>

    <VChip
      pill
      :label="false"
      :prepend-avatar="avatar3"
    >
      <span>Felicia Risker</span>
    </VChip>

    <VChip
      pill
      :label="false"
    >
      <VAvatar
        start
        :image="avatar4"
      />
      <span>Minnie Mostly</span>
    </VChip>
  </div>
</template>
`,js:`<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
<\/script>

<template>
  <div class="demo-space-x">
    <VChip>
      <VAvatar
        start
        :image="avatar1"
      />
      <span>John Doe</span>
    </VChip>

    <VChip>
      <VAvatar
        start
        :image="avatar2"
      />
      <span>Darcy Nooser</span>
    </VChip>

    <VChip
      pill
      :label="false"
      :prepend-avatar="avatar3"
    >
      <span>Felicia Risker</span>
    </VChip>

    <VChip
      pill
      :label="false"
    >
      <VAvatar
        start
        :image="avatar4"
      />
      <span>Minnie Mostly</span>
    </VChip>
  </div>
</template>
`},Me={ts:`<template>
  <div class="demo-space-x">
    <VChip>
      <VIcon
        start
        icon="bx-user"
      />
      Account
    </VChip>

    <VChip color="primary">
      <VIcon
        start
        icon="bx-star"
      />
      Premium
    </VChip>

    <VChip color="secondary">
      <VIcon
        start
        icon="bx-cake"
      />
      1 Year
    </VChip>

    <VChip color="success">
      <VIcon
        start
        icon="bx-bell"
      />
      Notification
    </VChip>

    <VChip color="info">
      <VIcon
        start
        icon="bx-message"
      />
      Message
    </VChip>

    <VChip color="warning">
      <VIcon
        start
        icon="bx-error"
      />
      Warning
    </VChip>

    <VChip color="error">
      <VIcon
        start
        icon="bx-error-circle"
      />
      Error
    </VChip>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VChip>
      <VIcon
        start
        icon="bx-user"
      />
      Account
    </VChip>

    <VChip color="primary">
      <VIcon
        start
        icon="bx-star"
      />
      Premium
    </VChip>

    <VChip color="secondary">
      <VIcon
        start
        icon="bx-cake"
      />
      1 Year
    </VChip>

    <VChip color="success">
      <VIcon
        start
        icon="bx-bell"
      />
      Notification
    </VChip>

    <VChip color="info">
      <VIcon
        start
        icon="bx-message"
      />
      Message
    </VChip>

    <VChip color="warning">
      <VIcon
        start
        icon="bx-error"
      />
      Warning
    </VChip>

    <VChip color="error">
      <VIcon
        start
        icon="bx-error-circle"
      />
      Error
    </VChip>
  </div>
</template>
`},Je=t("p",null,[a("Use "),t("code",null,"color"),a(" prop to change the background color of chips.")],-1),Te=t("p",null,[a("Use "),t("code",null,"elevated"),a(" variant option to create filled chips.")],-1),je=t("p",null,[a("Use "),t("code",null,"outlined"),a(" variant option to create outline border chips.")],-1),Ne=t("p",null,[a("To use the rounded chip, set "),t("code",null,"label"),a(" props value to "),t("strong",null,"false"),a(".")],-1),Be=t("p",null,[a("Closable chips can be controlled with a "),t("code",null,"v-model"),a(".")],-1),Re=t("p",null,"Chips can use text or any icon available in the Material Icons font library.",-1),Fe=t("p",null,[a("Use "),t("code",null,"pill"),a(" prop to remove the "),t("code",null,"v-avatar"),a(" padding.")],-1),Ue=t("p",null,[a("The "),t("code",null,"v-chip"),a(" component can have various sizes from "),t("code",null,"x-small"),a(" to "),t("code",null,"x-large"),a(".")],-1),Ye=t("p",null,[a("Selects can use "),t("code",null,"chips"),a(" to display the selected data. Try adding your own tags below.")],-1),Oe=t("p",null,[a("Chips can be combined with "),t("code",null,"v-menu"),a(" to enable a specific set of actions for a chip.")],-1),ki=S({__name:"chip",setup(d){return(r,V)=>{const p=De,l=Y,v=ye,b=_e,x=he,D=pe,n=ce,C=te,P=X,E=q,$=K;return c(),h(O,{class:"match-height"},{default:i(()=>[e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Color",code:Pe},{default:i(()=>[Je,e(p)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Elevated",code:Ee},{default:i(()=>[Te,e(v)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Outlined",code:we},{default:i(()=>[je,e(b)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Rounded",code:ze},{default:i(()=>[Ne,e(x)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Closable",code:ke},{default:i(()=>[Be,e(D)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"With Icon",code:Me},{default:i(()=>[Re,e(n)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"With Avatar",code:Ae},{default:i(()=>[Fe,e(C)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Sizes",code:Le},{default:i(()=>[Ue,e(P)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"In Selects",code:We},{default:i(()=>[Ye,e(E)]),_:1},8,["code"])]),_:1}),e(m,{cols:"12",md:"6"},{default:i(()=>[e(l,{title:"Expandable",code:$e},{default:i(()=>[Oe,e($)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{ki as default};
