import{_ as b}from"./AppTextField.vue_vue_type_script_setup_true_lang-BoxFt9XM.js";import{V as U}from"./VNodeRenderer-CRBRude9.js";import{d as v,r as _,o as u,g as f,f as l,b as e,a2 as F,q as S,t as n,cQ as q,n as i,ay as j,G as H,ag as N,c as L,y as z,ah as V,K as g,e as o}from"./main-BaC4daP5.js";import{V as B}from"./VTooltip-CDvWkDny.js";import{a as s,V as C}from"./VRow-MD441sKt.js";import{r as E,e as W}from"./validators-DpYrMFzk.js";import{V as Y}from"./VForm-CKfyBDx3.js";import{V as w}from"./VTextField-Cnd2jctO.js";import{_ as O}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import"./form-Bx6DrHT2.js";import"./VOverlay-BFLsqd3w.js";import"./easing-CjukEv2V.js";import"./delay-QQ7368Uq.js";import"./lazy-dhMtJnkj.js";import"./scopeId-ZR_fbP0-.js";import"./VImg-DaBIesWz.js";import"./forwardRefs-C-GTDzx5.js";/* empty css              */import"./helpers-DK5QwNv0.js";/* empty css                   */import"./VCounter-BXlqD8Be.js";import"./VField-CelNtUMo.js";import"./VInput-khHNYcPy.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";import"./VAvatar-C7kH6m2U.js";import"./VCardText-yg2yyEKt.js";import"./VDivider-OHXYM3-S.js";const G={key:0,class:"ms-3"},K=v({__name:"DemoTextfieldIconSlots",setup(x){const a=_("Hey!"),t=_(!1),m=()=>{t.value=!0,a.value="Wait for it...",setTimeout(()=>{t.value=!1,a.value="You've clicked me!"},2e3)};return(r,p)=>{const d=b;return u(),f(d,{modelValue:i(a),"onUpdate:modelValue":p[0]||(p[0]=c=>V(a)?a.value=c:null),clearable:"",label:"Message",placeholder:"Hey!!",type:"text",class:"textfield-demo-icon-slot"},{prepend:l(()=>[e(B,{location:"bottom"},{activator:l(({props:c})=>[e(F,S(c,{icon:"bx-help-circle"}),null,16)]),default:l(()=>[n(" I'm a tooltip ")]),_:1})]),"append-inner":l(()=>[e(q,{"leave-absolute":""},{default:l(()=>[i(t)?(u(),f(j,{key:0,color:"primary",width:"3",size:"24",indeterminate:""})):(u(),f(i(U),{key:1,class:"text-2xl",nodes:i(H).app.logo},null,8,["nodes"]))]),_:1})]),append:l(()=>[e(N,{icon:r.$vuetify.display.smAndDown,onClick:m},{default:l(()=>[e(F,{icon:"bx-target-lock",color:"#fff",size:"22"}),r.$vuetify.display.mdAndUp?(u(),L("span",G,"Click me")):z("",!0)]),_:1},8,["icon"])]),_:1},8,["modelValue"])}}}),Q=g(K,[["__scopeId","data-v-de699c27"]]),J=v({__name:"DemoTextfieldPasswordInput",setup(x){const a=_(!1),t=_(!0),m=_("Password"),r=_("wqfasds"),p={required:d=>!!d||"Required.",min:d=>d.length>=8||"Min 8 characters"};return(d,c)=>{const h=b;return u(),f(C,null,{default:l(()=>[e(s,{cols:"12",sm:"6"},{default:l(()=>[e(h,{modelValue:i(m),"onUpdate:modelValue":c[0]||(c[0]=T=>V(m)?m.value=T:null),"append-inner-icon":i(a)?"bx-hide":"bx-show",rules:[p.required,p.min],type:i(a)?"text":"password",name:"input-10-1",label:"Normal with hint text",hint:"At least 8 characters",placeholder:"············",counter:"","onClick:appendInner":c[1]||(c[1]=T=>a.value=!i(a))},null,8,["modelValue","append-inner-icon","rules","type"])]),_:1}),e(s,{cols:"12",sm:"6"},{default:l(()=>[e(h,{modelValue:i(r),"onUpdate:modelValue":c[2]||(c[2]=T=>V(r)?r.value=T:null),rules:[p.required,p.min],"append-inner-icon":i(t)?"bx-hide":"bx-show",type:i(t)?"text":"password",name:"input-10-2",placeholder:"············",label:"Visible",hint:"At least 8 characters","onClick:appendInner":c[3]||(c[3]=T=>t.value=!i(t))},null,8,["modelValue","rules","append-inner-icon","type"])]),_:1})]),_:1})}}}),X={},Z=o("strong",null,"icon",-1);function ee(x,a){const t=b;return u(),f(t,null,{label:l(()=>[n(" What about  "),Z,n(" here? "),e(F,{icon:"bx-file-find"})]),_:1})}const le=g(X,[["render",ee]]),te=v({__name:"DemoTextfieldIconEvents",setup(x){const a=_("Hey!"),t=_(!0),m=_(0),r=()=>{t.value=!t.value},p=()=>{a.value=""},d=()=>{m.value=0},c=()=>{d(),p()};return(h,T)=>{const y=b;return u(),f(y,{modelValue:i(a),"onUpdate:modelValue":T[0]||(T[0]=A=>V(a)?a.value=A:null),clearable:"",type:"text",label:"Message",color:"primary",placeholder:"Hey!!","clear-icon":"bx-x-circle","append-icon":i(a)?h.$vuetify.locale.isRtl?"bx-arrow-from-right":"bx-arrow-from-left":"bx-microphone","append-inner-icon":i(t)?"bx-alarm":"bx-alarm-off","onClick:appendInner":r,"onClick:append":c,"onClick:clear":p},null,8,["modelValue","append-icon","append-inner-icon"])}}}),oe=v({__name:"DemoTextfieldValidation",setup(x){const a=_("");return(t,m)=>{const r=b;return u(),f(Y,null,{default:l(()=>[e(r,{modelValue:i(a),"onUpdate:modelValue":m[0]||(m[0]=p=>V(a)?a.value=p:null),rules:["requiredValidator"in t?t.requiredValidator:i(E),"emailValidator"in t?t.emailValidator:i(W)],placeholder:"johnedoe@email.com",label:"E-mail"},null,8,["modelValue","rules"])]),_:1})}}}),ne={};function ae(x,a){const t=b;return u(),f(t,{label:"Regular",placeholder:"Placeholder Text","single-line":""})}const se=g(ne,[["render",ae]]),re=v({__name:"DemoTextfieldPrefixesAndSuffixes",setup(x){const a=_(10.05),t=_(28.02),m=_("example"),r=_("04:56");return(p,d)=>{const c=b;return u(),f(C,null,{default:l(()=>[e(s,{cols:"12"},{default:l(()=>[e(c,{modelValue:i(a),"onUpdate:modelValue":d[0]||(d[0]=h=>V(a)?a.value=h:null),label:"Amount",prefix:"$",type:"number",placeholder:"10.05"},null,8,["modelValue"])]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(c,{modelValue:i(t),"onUpdate:modelValue":d[1]||(d[1]=h=>V(t)?t.value=h:null),label:"Weight",suffix:"lbs",type:"number",placeholder:"28.02"},null,8,["modelValue"])]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(c,{modelValue:i(m),"onUpdate:modelValue":d[2]||(d[2]=h=>V(m)?m.value=h:null),label:"Email address",suffix:"@gmail.com",placeholder:"example"},null,8,["modelValue"])]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(c,{modelValue:i(r),"onUpdate:modelValue":d[3]||(d[3]=h=>V(r)?r.value=h:null),label:"Label Text",type:"time",suffix:"PST",placeholder:"04:56"},null,8,["modelValue"])]),_:1})]),_:1})}}}),ce={};function ie(x,a){const t=b;return u(),f(C,null,{default:l(()=>[e(s,{cols:"12"},{default:l(()=>[e(t,{label:"Prepend","prepend-icon":"bx-map",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(t,{label:"Prepend Inner","prepend-inner-icon":"bx-map",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(t,{label:"Append","append-icon":"bx-map",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(t,{label:"Append Inner","append-inner-icon":"bx-map",placeholder:"Placeholder Text"})]),_:1})]),_:1})}const de=g(ce,[["render",ie]]),pe={};function me(x,a){const t=b;return u(),f(t,{color:"success",label:"First name",placeholder:"Placeholder Text"})}const ue=g(pe,[["render",me]]),fe={};function _e(x,a){const t=b;return u(),f(t,{placeholder:"Placeholder Text",label:"Regular",clearable:""})}const xe=g(fe,[["render",_e]]),he=v({__name:"DemoTextfieldCounter",setup(x){const a=_("Preliminary report"),t=_("California is a state in the western United States"),m=[r=>r.length<=25||"Max 25 characters"];return(r,p)=>{const d=b;return u(),f(C,null,{default:l(()=>[e(s,{cols:"12"},{default:l(()=>[e(d,{modelValue:i(a),"onUpdate:modelValue":p[0]||(p[0]=c=>V(a)?a.value=c:null),rules:m,counter:"25",placeholder:"Placeholder Text",hint:"This field uses counter prop",label:"Regular"},null,8,["modelValue"])]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(d,{modelValue:i(t),"onUpdate:modelValue":p[1]||(p[1]=c=>V(t)?t.value=c:null),rules:m,counter:"",maxlength:"25",placeholder:"Placeholder Text",hint:"This field uses maxlength attribute",label:"Limit exceeded"},null,8,["modelValue"])]),_:1})]),_:1})}}}),be={};function Ve(x,a){const t=b;return u(),f(C,null,{default:l(()=>[e(s,null,{default:l(()=>[e(t,{label:"Disabled",placeholder:"Placeholder Text",disabled:""})]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(t,{placeholder:"Placeholder Text",label:"Readonly",readonly:""})]),_:1})]),_:1})}const Te=g(be,[["render",Ve]]),ge={};function ve(x,a){return u(),f(C,null,{default:l(()=>[e(s,{cols:"12",md:"6"},{default:l(()=>[e(w,{label:"Outlined",variant:"outlined"})]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(w,{label:"Filled",variant:"filled",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(w,{label:"Solo",variant:"solo",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(w,{label:"Plain",variant:"plain",placeholder:"Placeholder Text"})]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(w,{label:"Underlined",variant:"underlined",placeholder:"Placeholder Text"})]),_:1})]),_:1})}const Ce=g(ge,[["render",ve]]),we={};function ye(x,a){const t=b;return u(),f(t,{label:"Compact",density:"compact",placeholder:"Placeholder Text"})}const Ae=g(we,[["render",ye]]),Fe={};function Pe(x,a){const t=b;return u(),f(t,{label:"Regular",placeholder:"Placeholder Text"})}const ke=g(Fe,[["render",Pe]]),Re={ts:`<template>
  <AppTextField
    label="Regular"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<template>
  <AppTextField
    label="Regular"
    placeholder="Placeholder Text"
  />
</template>
`},Ie={ts:`<template>
  <AppTextField
    placeholder="Placeholder Text"
    label="Regular"
    clearable
  />
</template>
`,js:`<template>
  <AppTextField
    placeholder="Placeholder Text"
    label="Regular"
    clearable
  />
</template>
`},$e={ts:`<script lang="ts" setup>
const title = ref('Preliminary report')
const description = ref('California is a state in the western United States')
const rules = [(v: string) => v.length <= 25 || 'Max 25 characters']
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        v-model="title"
        :rules="rules"
        counter="25"
        placeholder="Placeholder Text"
        hint="This field uses counter prop"
        label="Regular"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="description"
        :rules="rules"
        counter
        maxlength="25"
        placeholder="Placeholder Text"
        hint="This field uses maxlength attribute"
        label="Limit exceeded"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const title = ref('Preliminary report')
const description = ref('California is a state in the western United States')
const rules = [v => v.length <= 25 || 'Max 25 characters']
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        v-model="title"
        :rules="rules"
        counter="25"
        placeholder="Placeholder Text"
        hint="This field uses counter prop"
        label="Regular"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="description"
        :rules="rules"
        counter
        maxlength="25"
        placeholder="Placeholder Text"
        hint="This field uses maxlength attribute"
        label="Limit exceeded"
      />
    </VCol>
  </VRow>
</template>
`},Me={ts:`<template>
  <AppTextField
    color="success"
    label="First name"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<template>
  <AppTextField
    color="success"
    label="First name"
    placeholder="Placeholder Text"
  />
</template>
`},De={ts:`<template>
  <AppTextField
    label="Compact"
    density="compact"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<template>
  <AppTextField
    label="Compact"
    density="compact"
    placeholder="Placeholder Text"
  />
</template>
`},Ue={ts:`<script lang="ts" setup>
const message = ref('Hey!')
const marker = ref(true)
const iconIndex = ref(0)

const toggleMarker = () => {
  marker.value = !marker.value
}

const clearMessage = () => {
  message.value = ''
}

const resetIcon = () => {
  iconIndex.value = 0
}

const sendMessage = () => {
  resetIcon()
  clearMessage()
}
<\/script>

<template>
  <AppTextField
    v-model="message"
    clearable
    type="text"
    label="Message"
    color="primary"
    placeholder="Hey!!"
    clear-icon="bx-x-circle"
    :append-icon="message ? $vuetify.locale.isRtl ? 'bx-arrow-from-right' : 'bx-arrow-from-left' : 'bx-microphone'"
    :append-inner-icon="marker ? 'bx-alarm' : 'bx-alarm-off'"
    @click:append-inner="toggleMarker"
    @click:append="sendMessage"
    @click:clear="clearMessage"
  />
</template>
`,js:`<script setup>
const message = ref('Hey!')
const marker = ref(true)
const iconIndex = ref(0)

const toggleMarker = () => {
  marker.value = !marker.value
}

const clearMessage = () => {
  message.value = ''
}

const resetIcon = () => {
  iconIndex.value = 0
}

const sendMessage = () => {
  resetIcon()
  clearMessage()
}
<\/script>

<template>
  <AppTextField
    v-model="message"
    clearable
    type="text"
    label="Message"
    color="primary"
    placeholder="Hey!!"
    clear-icon="bx-x-circle"
    :append-icon="message ? $vuetify.locale.isRtl ? 'bx-arrow-from-right' : 'bx-arrow-from-left' : 'bx-microphone'"
    :append-inner-icon="marker ? 'bx-alarm' : 'bx-alarm-off'"
    @click:append-inner="toggleMarker"
    @click:append="sendMessage"
    @click:clear="clearMessage"
  />
</template>
`},Se={ts:`<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const message = ref('Hey!')
const loading = ref(false)

const clickMe = () => {
  loading.value = true
  message.value = 'Wait for it...'

  setTimeout(() => {
    loading.value = false
    message.value = 'You've clicked me!'
  }, 2000)
}
<\/script>

<template>
  <AppTextField
    v-model="message"
    clearable
    label="Message"
    placeholder="Hey!!"
    type="text"
    class="textfield-demo-icon-slot"
  >
    <!-- Prepend -->
    <template #prepend>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <VIcon
            v-bind="props"
            icon="bx-help-circle"
          />
        </template>
        I'm a tooltip
      </VTooltip>
    </template>

    <!-- AppendInner -->
    <template #append-inner>
      <VFadeTransition leave-absolute>
        <VProgressCircular
          v-if="loading"
          color="primary"
          width="3"
          size="24"
          indeterminate
        />

        <VNodeRenderer
          v-else
          class="text-2xl"
          :nodes="themeConfig.app.logo"
        />
      </VFadeTransition>
    </template>

    <!-- Append -->
    <template #append>
      <VBtn
        :icon="$vuetify.display.smAndDown"
        @click="clickMe"
      >
        <VIcon
          icon="bx-target-lock"
          color="#fff"
          size="22"
        />
        <span
          v-if="$vuetify.display.mdAndUp"
          class="ms-3"
        >Click me</span>
      </VBtn>
    </template>
  </AppTextField>
</template>

<style lang="scss" scoped>
// .textfield-demo-icon-slot {
//   :deep(.v-input) {
//     align-content: center;

//     .v-input__prepend,
//     .v-input__append {
//       padding-block-start: 0 !important;
//     }

//     .v-input__prepend {
//       align-items: center;
//     }

//     .v-field__append-inner .v-progress-circular svg {
//       block-size: 1.3em;
//       inline-size: 1.3em;
//     }

//     .v-field__append-inner svg {
//       margin-block-start: 0.1rem;
//     }
//   }
// }
</style>
`,js:`<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const message = ref('Hey!')
const loading = ref(false)

const clickMe = () => {
  loading.value = true
  message.value = 'Wait for it...'
  setTimeout(() => {
    loading.value = false
    message.value = 'You've clicked me!'
  }, 2000)
}
<\/script>

<template>
  <AppTextField
    v-model="message"
    clearable
    label="Message"
    placeholder="Hey!!"
    type="text"
    class="textfield-demo-icon-slot"
  >
    <!-- Prepend -->
    <template #prepend>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <VIcon
            v-bind="props"
            icon="bx-help-circle"
          />
        </template>
        I'm a tooltip
      </VTooltip>
    </template>

    <!-- AppendInner -->
    <template #append-inner>
      <VFadeTransition leave-absolute>
        <VProgressCircular
          v-if="loading"
          color="primary"
          width="3"
          size="24"
          indeterminate
        />

        <VNodeRenderer
          v-else
          class="text-2xl"
          :nodes="themeConfig.app.logo"
        />
      </VFadeTransition>
    </template>

    <!-- Append -->
    <template #append>
      <VBtn
        :icon="$vuetify.display.smAndDown"
        @click="clickMe"
      >
        <VIcon
          icon="bx-target-lock"
          color="#fff"
          size="22"
        />
        <span
          v-if="$vuetify.display.mdAndUp"
          class="ms-3"
        >Click me</span>
      </VBtn>
    </template>
  </AppTextField>
</template>

<style lang="scss" scoped>
// .textfield-demo-icon-slot {
//   :deep(.v-input) {
//     align-content: center;

//     .v-input__prepend,
//     .v-input__append {
//       padding-block-start: 0 !important;
//     }

//     .v-input__prepend {
//       align-items: center;
//     }

//     .v-field__append-inner .v-progress-circular svg {
//       block-size: 1.3em;
//       inline-size: 1.3em;
//     }

//     .v-field__append-inner svg {
//       margin-block-start: 0.1rem;
//     }
//   }
// }
</style>
`},qe={ts:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        label="Prepend"
        prepend-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Prepend Inner"
        prepend-inner-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Append"
        append-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Append Inner"
        append-inner-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        label="Prepend"
        prepend-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Prepend Inner"
        prepend-inner-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Append"
        append-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        label="Append Inner"
        append-inner-icon="bx-map"
        placeholder="Placeholder Text"
      />
    </VCol>
  </VRow>
</template>
`},je={ts:`<template>
  <AppTextField>
    <template #label>
      What about &nbsp;<strong>icon</strong>&nbsp;here?
      <VIcon icon="bx-file-find" />
    </template>
  </AppTextField>
</template>
`,js:`<template>
  <AppTextField>
    <template #label>
      What about &nbsp;<strong>icon</strong>&nbsp;here?
      <VIcon icon="bx-file-find" />
    </template>
  </AppTextField>
</template>
`},He={ts:`<script lang="ts" setup>
const show1 = ref(false)
const show2 = ref(true)
const password = ref('Password')
const confirmPassword = ref('wqfasds')

const rules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || 'Min 8 characters',
}
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <AppTextField
        v-model="password"
        :append-inner-icon="show1 ? 'bx-hide' : 'bx-show' "
        :rules="[rules.required, rules.min]"
        :type="show1 ? 'text' : 'password'"
        name="input-10-1"
        label="Normal with hint text"
        hint="At least 8 characters"
        placeholder="············"
        counter
        @click:append-inner="show1 = !show1"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextField
        v-model="confirmPassword"
        :rules="[rules.required, rules.min]"
        :append-inner-icon="show2 ? 'bx-hide' : 'bx-show' "
        :type="show2 ? 'text' : 'password'"
        name="input-10-2"
        placeholder="············"
        label="Visible"
        hint="At least 8 characters"
        @click:append-inner="show2 = !show2"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const show1 = ref(false)
const show2 = ref(true)
const password = ref('Password')
const confirmPassword = ref('wqfasds')

const rules = {
  required: value => !!value || 'Required.',
  min: v => v.length >= 8 || 'Min 8 characters',
}
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <AppTextField
        v-model="password"
        :append-inner-icon="show1 ? 'bx-hide' : 'bx-show' "
        :rules="[rules.required, rules.min]"
        :type="show1 ? 'text' : 'password'"
        name="input-10-1"
        label="Normal with hint text"
        hint="At least 8 characters"
        placeholder="············"
        counter
        @click:append-inner="show1 = !show1"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextField
        v-model="confirmPassword"
        :rules="[rules.required, rules.min]"
        :append-inner-icon="show2 ? 'bx-hide' : 'bx-show' "
        :type="show2 ? 'text' : 'password'"
        name="input-10-2"
        placeholder="············"
        label="Visible"
        hint="At least 8 characters"
        @click:append-inner="show2 = !show2"
      />
    </VCol>
  </VRow>
</template>
`},Ne={ts:`<script setup lang="ts">
const amount = ref(10.05)
const weight = ref(28.02)
const email = ref('example')
const time = ref('04:56')
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        v-model="amount"
        label="Amount"
        prefix="$"
        type="number"
        placeholder="10.05"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="weight"
        label="Weight"
        suffix="lbs"
        type="number"
        placeholder="28.02"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="email"
        label="Email address"
        suffix="@gmail.com"
        placeholder="example"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="time"
        label="Label Text"
        type="time"
        suffix="PST"
        placeholder="04:56"
      />
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const amount = ref(10.05)
const weight = ref(28.02)
const email = ref('example')
const time = ref('04:56')
<\/script>

<template>
  <VRow>
    <VCol cols="12">
      <AppTextField
        v-model="amount"
        label="Amount"
        prefix="$"
        type="number"
        placeholder="10.05"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="weight"
        label="Weight"
        suffix="lbs"
        type="number"
        placeholder="28.02"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="email"
        label="Email address"
        suffix="@gmail.com"
        placeholder="example"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="time"
        label="Label Text"
        type="time"
        suffix="PST"
        placeholder="04:56"
      />
    </VCol>
  </VRow>
</template>
`},Le={ts:`<template>
  <AppTextField
    label="Regular"
    placeholder="Placeholder Text"
    single-line
  />
</template>
`,js:`<template>
  <AppTextField
    label="Regular"
    placeholder="Placeholder Text"
    single-line
  />
</template>
`},ze={ts:`<template>
  <VRow>
    <VCol>
      <AppTextField
        label="Disabled"
        placeholder="Placeholder Text"
        disabled
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        placeholder="Placeholder Text"
        label="Readonly"
        readonly
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol>
      <AppTextField
        label="Disabled"
        placeholder="Placeholder Text"
        disabled
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        placeholder="Placeholder Text"
        label="Readonly"
        readonly
      />
    </VCol>
  </VRow>
</template>
`},Be={ts:`<script lang="ts" setup>
const email = ref('')
<\/script>

<template>
  <VForm>
    <AppTextField
      v-model="email"
      :rules="[requiredValidator, emailValidator]"
      placeholder="johnedoe@email.com"
      label="E-mail"
    />
  </VForm>
</template>
`,js:`<script setup>
const email = ref('')
<\/script>

<template>
  <VForm>
    <AppTextField
      v-model="email"
      :rules="[requiredValidator, emailValidator]"
      placeholder="johnedoe@email.com"
      label="E-mail"
    />
  </VForm>
</template>
`},Ee={ts:`<template>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Outlined"
        variant="outlined"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Filled"
        variant="filled"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Solo"
        variant="solo"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Plain"
        variant="plain"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Underlined"
        variant="underlined"
        placeholder="Placeholder Text"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Outlined"
        variant="outlined"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Filled"
        variant="filled"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Solo"
        variant="solo"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Plain"
        variant="plain"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VTextField
        label="Underlined"
        variant="underlined"
        placeholder="Placeholder Text"
      />
    </VCol>
  </VRow>
</template>
`},We=o("p",null,"Text fields components are used for collecting user provided information.",-1),Ye=o("p",null,[n("The "),o("code",null,"density"),n(" prop decreases the height of the text field based upon levels of density; "),o("code",null,"default"),n(","),o("code",null,"comfortable"),n(", and "),o("code",null,"compact"),n(".")],-1),Oe=o("p",null,[n("Use "),o("code",null,"solo"),n(", "),o("code",null,"filled"),n(", "),o("code",null,"outlined"),n(", "),o("code",null,"plain"),n(" and "),o("code",null,"underlined"),n(" option of "),o("code",null,"variant"),n(" prop to change the look of the textfield. ")],-1),Ge=o("p",null,"Text fields can be disabled or readonly.",-1),Ke=o("p",null,[n("Use a "),o("code",null,"counter"),n(" prop to inform a user of the character limit.")],-1),Qe=o("p",null,"When clearable, you can customize the clear icon with clear-icon.",-1),Je=o("p",null,[n("Use "),o("code",null,"color"),n(" prop to change the input border color.")],-1),Xe=o("p",null,[n("You can add icons to the text field with "),o("code",null,"prepend-icon"),n(", "),o("code",null,"append-icon"),n(" and "),o("code",null,"append-inner-icon"),n(" and "),o("code",null,"prepend-inner-icon"),n(" props.")],-1),Ze=o("p",null,[n("The "),o("code",null,"prefix"),n(" and "),o("code",null,"suffix"),n(" properties allows you to prepend and append inline non-modifiable text next to the text field.")],-1),el=o("p",null,[o("code",null,"single-line"),n(" text fields do not float their label on focus or with data.")],-1),ll=o("p",null,[n("Vuetify includes simple validation through the "),o("code",null,"rules"),n(" prop.")],-1),tl=o("p",null,[o("code",null,"click:prepend"),n(", "),o("code",null,"click:append"),n(", "),o("code",null,"click:append-inner"),n(", and "),o("code",null,"click:clear"),n(" will be emitted when you click on the respective icon")],-1),ol=o("p",null,[n("Text field label can be defined in "),o("code",null,"label"),n(" slot - that will allow to use HTML content.")],-1),nl=o("p",null,[n("Using the HTML input "),o("code",null,"type"),n(" password can be used with an appended icon and callback to control the visibility.")],-1),al=o("p",null,[n("Instead of using "),o("code",null,"prepend"),n("/"),o("code",null,"append"),n("/"),o("code",null,"append-inner"),n(" icons you can use slots to extend input's functionality.")],-1),Dl=v({__name:"textfield",setup(x){return(a,t)=>{const m=ke,r=O,p=Ae,d=Ce,c=Te,h=he,T=xe,y=ue,A=de,P=re,k=se,R=oe,I=te,$=le,M=J,D=Q;return u(),f(C,{class:"match-height"},{default:l(()=>[e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Basic",code:Re},{default:l(()=>[We,e(m)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Density",code:De},{default:l(()=>[Ye,e(p)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12"},{default:l(()=>[e(r,{title:"Variant",code:Ee},{default:l(()=>[Oe,e(d)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"State",code:ze},{default:l(()=>[Ge,e(c)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Counter",code:$e},{default:l(()=>[Ke,e(h)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Clearable",code:Ie},{default:l(()=>[Qe,e(T)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Custom Colors",code:Me},{default:l(()=>[Je,e(y)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Icons",code:qe},{default:l(()=>[Xe,e(A)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Prefixes and suffixes",code:Ne},{default:l(()=>[Ze,e(P)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Single line",code:Le},{default:l(()=>[el,e(k)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Validation",code:Be},{default:l(()=>[ll,e(R)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Icon events",code:Ue},{default:l(()=>[tl,e(I)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Label Slot",code:je},{default:l(()=>[ol,e($)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Password input",code:He},{default:l(()=>[nl,e(M)]),_:1},8,["code"])]),_:1}),e(s,{cols:"12",md:"6"},{default:l(()=>[e(r,{title:"Icon slots",code:Se},{default:l(()=>[al,e(D)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Dl as default};
