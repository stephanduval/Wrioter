import{_ as z}from"./AppSelect.vue_vue_type_script_setup_true_lang-CVASJ1YQ.js";import{_ as R}from"./AppTextField.vue_vue_type_script_setup_true_lang-DLolXYam.js";import{_ as q}from"./AppStepper.vue_vue_type_style_index_0_lang-DC58lX0v.js";import{a as i,V as v}from"./VRow-EsZ_8CZn.js";import{V as j}from"./VCard-k3dQT3Up.js";import{V as N}from"./VCardText-iX3erHMv.js";import{V as W}from"./VForm-BECb0SyC.js";import{V as E,a as C}from"./VWindowItem-Bb1wYQHc.js";import{d as $,r as b,o as S,g as _,f as o,b as e,e as r,n as l,ah as T,ag as w,a2 as k,t as g,c as U,a4 as te,v as u,F as X,am as G,x as se}from"./main-Ca4qx7y-.js";import{_ as re}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import{V as P}from"./VDivider-CMgOCZ_h.js";import{r as A,e as ie,p as de,d as ne,u as M}from"./validators-DpYrMFzk.js";import"./form-C6PetfES.js";import"./VSelect-D7uk1eqE.js";import"./VTextField-DA7n0c0j.js";/* empty css                   */import"./VCounter-DbxmW7Y4.js";import"./VImg-C3GobFkp.js";import"./VField-ZOdg6ueh.js";import"./easing-CjukEv2V.js";import"./VInput-iEBwr0fp.js";import"./forwardRefs-C-GTDzx5.js";import"./VList-P5iFN8Pn.js";import"./ssrBoot-WXvDeQ_A.js";import"./VAvatar-B3k1LwfD.js";import"./dialog-transition-ianbTZuP.js";import"./VMenu-BXWqdo-4.js";import"./VOverlay-C-c1GQAd.js";import"./delay-DDujfhaz.js";import"./lazy-He9qliih.js";import"./scopeId-B0kCZn--.js";import"./VCheckboxBtn-IHz41y0p.js";import"./VSelectionControl-CJpIFID9.js";import"./VChip-BPUxCjj5.js";import"./VSlideGroup-DbGP5EjM.js";/* empty css              */import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./helpers-DK5QwNv0.js";const ce={class:"pa-6"},me=r("h6",{class:"text-h6 font-weight-medium"}," Account Details ",-1),pe=r("p",{class:"mb-0"}," Enter your Account Details ",-1),ue=r("h6",{class:"text-h6 font-weight-medium"}," Personal Info ",-1),Ve=r("p",{class:"mb-0"}," Setup Information ",-1),be=r("h6",{class:"text-h6 font-weight-medium"}," Social Links ",-1),fe=r("p",{class:"mb-0"}," Add Social Links ",-1),he={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},we=$({__name:"DemoFormWizardIconsModernVertical",setup(D){const x=[{title:"Account Details",icon:"bx-file",subtitle:"Setup account details"},{title:"Personal Info",icon:"bx-user",subtitle:"Add personal info"},{title:"Social Links",icon:"bx-link",subtitle:"Add social links"}],n=b(0),V=b(!1),f=b(!1),t=b({username:"",email:"",password:"",cPassword:"",firstName:"",lastName:"",country:void 0,language:void 0,twitter:"",facebook:"",googlePlus:"",linkedIn:""}),I=()=>{console.log(t.value)};return(B,a)=>{const L=q,d=R,h=z;return S(),_(v,null,{default:o(()=>[e(i,{cols:"12",md:"4"},{default:o(()=>[r("div",ce,[e(L,{"current-step":l(n),"onUpdate:currentStep":a[0]||(a[0]=s=>T(n)?n.value=s:null),direction:"vertical",items:x,"icon-size":"24",class:"stepper-icon-step-bg"},null,8,["current-step"])])]),_:1}),e(i,{cols:"12",md:"8"},{default:o(()=>[e(j,null,{default:o(()=>[e(N,null,{default:o(()=>[e(W,null,{default:o(()=>[e(E,{modelValue:l(n),"onUpdate:modelValue":a[15]||(a[15]=s=>T(n)?n.value=s:null),class:"disable-tab-transition"},{default:o(()=>[e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[me,pe]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).username,"onUpdate:modelValue":a[1]||(a[1]=s=>l(t).username=s),placeholder:"CarterLeonardo",label:"Username"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).email,"onUpdate:modelValue":a[2]||(a[2]=s=>l(t).email=s),placeholder:"carterleonardo@gmail.com",label:"Email"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).password,"onUpdate:modelValue":a[3]||(a[3]=s=>l(t).password=s),label:"Password",placeholder:"············",type:l(V)?"text":"password","append-inner-icon":l(V)?"bx-hide":"bx-show","onClick:appendInner":a[4]||(a[4]=s=>V.value=!l(V))},null,8,["modelValue","type","append-inner-icon"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).cPassword,"onUpdate:modelValue":a[5]||(a[5]=s=>l(t).cPassword=s),label:"Confirm Password",placeholder:"············",type:l(f)?"text":"password","append-inner-icon":l(f)?"bx-hide":"bx-show","onClick:appendInner":a[6]||(a[6]=s=>f.value=!l(f))},null,8,["modelValue","type","append-inner-icon"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[ue,Ve]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).firstName,"onUpdate:modelValue":a[7]||(a[7]=s=>l(t).firstName=s),label:"First Name",placeholder:"Leonard"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).lastName,"onUpdate:modelValue":a[8]||(a[8]=s=>l(t).lastName=s),label:"Last Name",placeholder:"Carter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).country,"onUpdate:modelValue":a[9]||(a[9]=s=>l(t).country=s),label:"Country",placeholder:"Select Country",items:["UK","USA","Canada","Australia","Germany"]},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).language,"onUpdate:modelValue":a[10]||(a[10]=s=>l(t).language=s),label:"Language",placeholder:"Select Language",items:["English","Spanish","French","Russian","German"]},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[be,fe]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).twitter,"onUpdate:modelValue":a[11]||(a[11]=s=>l(t).twitter=s),placeholder:"https://twitter.com/abc",label:"Twitter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).facebook,"onUpdate:modelValue":a[12]||(a[12]=s=>l(t).facebook=s),placeholder:"https://facebook.com/abc",label:"Facebook"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).googlePlus,"onUpdate:modelValue":a[13]||(a[13]=s=>l(t).googlePlus=s),placeholder:"https://plus.google.com/abc",label:"Google+"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).linkedIn,"onUpdate:modelValue":a[14]||(a[14]=s=>l(t).linkedIn=s),placeholder:"https://linkedin.com/abc",label:"LinkedIn"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"]),r("div",he,[e(w,{color:"secondary",variant:"tonal",disabled:l(n)===0,onClick:a[16]||(a[16]=s=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1},8,["disabled"]),x.length-1===l(n)?(S(),_(w,{key:0,color:"success",onClick:I},{default:o(()=>[g(" submit ")]),_:1})):(S(),_(w,{key:1,onClick:a[17]||(a[17]=s=>n.value++)},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1}))])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}}}),ge={ts:`<script setup lang="ts">
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: 'johndoe',
  email: 'john.doe@email.com',
  password: 'johndoe@J2',
  cPassword: 'johndoe@J2',
  firstName: 'John',
  lastName: 'Doe',
  country: 'UK',
  language: 'English',
  address: '98 Borough bridge Road, Birmingham',
  landmark: 'Borough bridge',
  pincode: '658921',
  city: 'Birmingham',
  twitter: 'https://twitter.com/abc',
  facebook: 'https://facebook.com/abc',
  googlePlus: 'https://plus.google.com/abc',
  LinkedIn: 'https://linkedin.com/abc',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VCard>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        :items="iconsSteps"
        align="center"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <!-- 👉 stepper content -->
      <VForm>
        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
        >
          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.username"
                  placeholder="CarterLeonardo"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.email"
                  placeholder="carterleonardo@gmail.com"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.cPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.firstName"
                  label="First Name"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.lastName"
                  label="Last Name"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.country"
                  label="Country"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.language"
                  label="Language"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.address"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.landmark"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.pincode"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.city"
                  placeholder="New York"
                  label="City"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.twitter"
                  placeholder="https://twitter.com/abc"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.facebook"
                  placeholder="https://facebook.com/abc"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  label="LinkedIn"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <div class="text-base">
              <h6 class="text-base font-weight-medium mb-2">
                Account
              </h6>

              <p class="mb-1">
                {{ formData.username }}
              </p>
              <p class="mb-1">
                {{ formData.email }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Personal Info
              </h6>

              <p class="mb-1">
                {{ formData.firstName }}
              </p>
              <p class="mb-1">
                {{ formData.lastName }}
              </p>
              <p class="mb-1">
                {{ formData.country }}
              </p>
              <p class="mb-1">
                {{ formData.language }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Address
              </h6>

              <p class="mb-1">
                {{ formData.address }}
              </p>
              <p class="mb-1">
                {{ formData.landmark }}
              </p>
              <p class="mb-1">
                {{ formData.pincode }}
              </p>
              <p class="mb-1">
                {{ formData.city }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Social Links
              </h6>

              <p class="mb-1">
                {{ formData.twitter }}
              </p>
              <p class="mb-1">
                {{ formData.facebook }}
              </p>
              <p class="mb-1">
                {{ formData.googlePlus }}
              </p>
              <p class="mb-1">
                {{ formData.LinkedIn }}
              </p>
            </div>
          </VWindowItem>
        </VWindow>

        <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon
              icon="bx-left-arrow-alt"
              start
              class="flip-in-rtl"
            />
            Previous
          </VBtn>

          <VBtn
            v-if="iconsSteps.length - 1 === currentStep"
            color="success"
            @click="onSubmit"
          >
            submit
          </VBtn>

          <VBtn
            v-else
            @click="currentStep++"
          >
            Next

            <VIcon
              icon="bx-right-arrow-alt"
              end
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
`,js:`<script setup>
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: 'johndoe',
  email: 'john.doe@email.com',
  password: 'johndoe@J2',
  cPassword: 'johndoe@J2',
  firstName: 'John',
  lastName: 'Doe',
  country: 'UK',
  language: 'English',
  address: '98 Borough bridge Road, Birmingham',
  landmark: 'Borough bridge',
  pincode: '658921',
  city: 'Birmingham',
  twitter: 'https://twitter.com/abc',
  facebook: 'https://facebook.com/abc',
  googlePlus: 'https://plus.google.com/abc',
  LinkedIn: 'https://linkedin.com/abc',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VCard>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        :items="iconsSteps"
        align="center"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <!-- 👉 stepper content -->
      <VForm>
        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
        >
          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.username"
                  placeholder="CarterLeonardo"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.email"
                  placeholder="carterleonardo@gmail.com"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.cPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.firstName"
                  label="First Name"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.lastName"
                  label="Last Name"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.country"
                  label="Country"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.language"
                  label="Language"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.address"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.landmark"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.pincode"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.city"
                  placeholder="New York"
                  label="City"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.twitter"
                  placeholder="https://twitter.com/abc"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.facebook"
                  placeholder="https://facebook.com/abc"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  label="LinkedIn"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <div class="text-base">
              <h6 class="text-base font-weight-medium mb-2">
                Account
              </h6>

              <p class="mb-1">
                {{ formData.username }}
              </p>
              <p class="mb-1">
                {{ formData.email }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Personal Info
              </h6>

              <p class="mb-1">
                {{ formData.firstName }}
              </p>
              <p class="mb-1">
                {{ formData.lastName }}
              </p>
              <p class="mb-1">
                {{ formData.country }}
              </p>
              <p class="mb-1">
                {{ formData.language }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Address
              </h6>

              <p class="mb-1">
                {{ formData.address }}
              </p>
              <p class="mb-1">
                {{ formData.landmark }}
              </p>
              <p class="mb-1">
                {{ formData.pincode }}
              </p>
              <p class="mb-1">
                {{ formData.city }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Social Links
              </h6>

              <p class="mb-1">
                {{ formData.twitter }}
              </p>
              <p class="mb-1">
                {{ formData.facebook }}
              </p>
              <p class="mb-1">
                {{ formData.googlePlus }}
              </p>
              <p class="mb-1">
                {{ formData.LinkedIn }}
              </p>
            </div>
          </VWindowItem>
        </VWindow>

        <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon
              icon="bx-left-arrow-alt"
              start
              class="flip-in-rtl"
            />
            Previous
          </VBtn>

          <VBtn
            v-if="iconsSteps.length - 1 === currentStep"
            color="success"
            @click="onSubmit"
          >
            submit
          </VBtn>

          <VBtn
            v-else
            @click="currentStep++"
          >
            Next

            <VIcon
              icon="bx-right-arrow-alt"
              end
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
`},ve={ts:`<script setup lang="ts">
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: 'johndoe',
  email: 'john.doe@email.com',
  password: 'johndoe@J2',
  cPassword: 'johndoe@J2',
  firstName: 'John',
  lastName: 'Doe',
  country: 'UK',
  language: 'English',
  address: '98 Borough bridge Road, Birmingham',
  landmark: 'Borough bridge',
  pincode: '658921',
  city: 'Birmingham',
  twitter: 'https://twitter.com/abc',
  facebook: 'https://facebook.com/abc',
  googlePlus: 'https://plus.google.com/abc',
  LinkedIn: 'https://linkedin.com/abc',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <!-- 👉 Stepper -->
  <div class="mb-6">
    <AppStepper
      v-model:current-step="currentStep"
      :items="iconsSteps"
    />
  </div>

  <VCard>
    <VCardText>
      <!-- 👉 stepper content -->
      <VForm>
        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
        >
          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.username"
                  placeholder="CarterLeonardo"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.email"
                  placeholder="carterleonardo@gmail.com"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.cPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.firstName"
                  label="First Name"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.lastName"
                  label="Last Name"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.country"
                  label="Country"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.language"
                  label="Language"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.address"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.landmark"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.pincode"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.city"
                  placeholder="New York"
                  label="City"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.twitter"
                  placeholder="https://twitter.com/abc"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.facebook"
                  placeholder="https://facebook.com/abc"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  label="LinkedIn"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <div class="text-base">
              <h6 class="text-base font-weight-medium mb-2">
                Account
              </h6>

              <p class="mb-1">
                {{ formData.username }}
              </p>
              <p class="mb-1">
                {{ formData.email }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Personal Info
              </h6>

              <p class="mb-1">
                {{ formData.firstName }}
              </p>
              <p class="mb-1">
                {{ formData.lastName }}
              </p>
              <p class="mb-1">
                {{ formData.country }}
              </p>
              <p class="mb-1">
                {{ formData.language }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Address
              </h6>

              <p class="mb-1">
                {{ formData.address }}
              </p>
              <p class="mb-1">
                {{ formData.landmark }}
              </p>
              <p class="mb-1">
                {{ formData.pincode }}
              </p>
              <p class="mb-1">
                {{ formData.city }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Social Links
              </h6>

              <p class="mb-1">
                {{ formData.twitter }}
              </p>
              <p class="mb-1">
                {{ formData.facebook }}
              </p>
              <p class="mb-1">
                {{ formData.googlePlus }}
              </p>
              <p class="mb-1">
                {{ formData.LinkedIn }}
              </p>
            </div>
          </VWindowItem>
        </VWindow>

        <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon
              icon="bx-left-arrow-alt"
              start
              class="flip-in-rtl"
            />
            Previous
          </VBtn>

          <VBtn
            v-if="iconsSteps.length - 1 === currentStep"
            color="success"
            @click="onSubmit"
          >
            submit
          </VBtn>

          <VBtn
            v-else
            @click="currentStep++"
          >
            Next

            <VIcon
              icon="bx-right-arrow-alt"
              end
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
`,js:`<script setup>
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: 'johndoe',
  email: 'john.doe@email.com',
  password: 'johndoe@J2',
  cPassword: 'johndoe@J2',
  firstName: 'John',
  lastName: 'Doe',
  country: 'UK',
  language: 'English',
  address: '98 Borough bridge Road, Birmingham',
  landmark: 'Borough bridge',
  pincode: '658921',
  city: 'Birmingham',
  twitter: 'https://twitter.com/abc',
  facebook: 'https://facebook.com/abc',
  googlePlus: 'https://plus.google.com/abc',
  LinkedIn: 'https://linkedin.com/abc',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <!-- 👉 Stepper -->
  <div class="mb-6">
    <AppStepper
      v-model:current-step="currentStep"
      :items="iconsSteps"
    />
  </div>

  <VCard>
    <VCardText>
      <!-- 👉 stepper content -->
      <VForm>
        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
        >
          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.username"
                  placeholder="CarterLeonardo"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.email"
                  placeholder="carterleonardo@gmail.com"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.cPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.firstName"
                  label="First Name"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.lastName"
                  label="Last Name"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.country"
                  label="Country"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.language"
                  label="Language"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.address"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.landmark"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.pincode"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.city"
                  placeholder="New York"
                  label="City"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.twitter"
                  placeholder="https://twitter.com/abc"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.facebook"
                  placeholder="https://facebook.com/abc"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  label="LinkedIn"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem>
            <div class="text-base">
              <h6 class="text-base font-weight-medium mb-2">
                Account
              </h6>

              <p class="mb-1">
                {{ formData.username }}
              </p>
              <p class="mb-1">
                {{ formData.email }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Personal Info
              </h6>

              <p class="mb-1">
                {{ formData.firstName }}
              </p>
              <p class="mb-1">
                {{ formData.lastName }}
              </p>
              <p class="mb-1">
                {{ formData.country }}
              </p>
              <p class="mb-1">
                {{ formData.language }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Address
              </h6>

              <p class="mb-1">
                {{ formData.address }}
              </p>
              <p class="mb-1">
                {{ formData.landmark }}
              </p>
              <p class="mb-1">
                {{ formData.pincode }}
              </p>
              <p class="mb-1">
                {{ formData.city }}
              </p>

              <VDivider class="my-4" />

              <h6 class="text-base font-weight-medium mb-2">
                Social Links
              </h6>

              <p class="mb-1">
                {{ formData.twitter }}
              </p>
              <p class="mb-1">
                {{ formData.facebook }}
              </p>
              <p class="mb-1">
                {{ formData.googlePlus }}
              </p>
              <p class="mb-1">
                {{ formData.LinkedIn }}
              </p>
            </div>
          </VWindowItem>
        </VWindow>

        <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon
              icon="bx-left-arrow-alt"
              start
              class="flip-in-rtl"
            />
            Previous
          </VBtn>

          <VBtn
            v-if="iconsSteps.length - 1 === currentStep"
            color="success"
            @click="onSubmit"
          >
            submit
          </VBtn>

          <VBtn
            v-else
            @click="currentStep++"
          >
            Next

            <VIcon
              icon="bx-right-arrow-alt"
              end
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
`},Ce={ts:`<script setup lang="ts">
const numberedSteps = [
  {
    title: 'Account Details',
    icon: 'bx-file',
    subtitle: 'Setup account details',
  },
  {
    title: 'Personal Info',
    icon: 'bx-user',
    subtitle: 'Add personal info',
  },
  {
    title: 'Social Links',
    icon: 'bx-link',
    subtitle: 'Add social links',
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',

})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="4"
    >
      <!-- 👉 Stepper -->
      <div class="pa-6">
        <AppStepper
          v-model:current-step="currentStep"
          direction="vertical"
          :items="numberedSteps"
          icon-size="24"
          class="stepper-icon-step-bg"
        />
      </div>
    </VCol>

    <!-- 👉 stepper content -->
    <VCol
      cols="12"
      md="8"
    >
      <VCard>
        <VCardText>
          <VForm>
            <VWindow
              v-model="currentStep"
              class="disable-tab-transition"
            >
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Account Details
                    </h6>
                    <p class="mb-0">
                      Enter your Account Details
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.username"
                      placeholder="CarterLeonardo"
                      label="Username"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.email"
                      placeholder="carterleonardo@gmail.com"
                      label="Email"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.password"
                      label="Password"
                      placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.cPassword"
                      label="Confirm Password"
                      placeholder="············"
                      :type="isCPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Personal Info
                    </h6>
                    <p class="mb-0">
                      Setup Information
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.firstName"
                      label="First Name"
                      placeholder="Leonard"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.lastName"
                      label="Last Name"
                      placeholder="Carter"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.country"
                      label="Country"
                      placeholder="Select Country"
                      :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.language"
                      label="Language"
                      placeholder="Select Language"
                      :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Social Links
                    </h6>
                    <p class="mb-0">
                      Add Social Links
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.twitter"
                      placeholder="https://twitter.com/abc"
                      label="Twitter"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.facebook"
                      placeholder="https://facebook.com/abc"
                      label="Facebook"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.googlePlus"
                      placeholder="https://plus.google.com/abc"
                      label="Google+"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.LinkedIn"
                      placeholder="https://linkedin.com/abc"
                      label="LinkedIn"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
            </VWindow>
            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>
              <VBtn
                v-if="numberedSteps.length - 1 === currentStep"
                color="success"
                @click="onSubmit"
              >
                submit
              </VBtn>
              <VBtn
                v-else
                @click="currentStep++"
              >
                Next
                <VIcon
                  icon="bx-right-arrow-alt"
                  end
                  class="flip-in-rtl"
                />
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
`,js:`<script setup>
const numberedSteps = [
  {
    title: 'Account Details',
    icon: 'bx-file',
    subtitle: 'Setup account details',
  },
  {
    title: 'Personal Info',
    icon: 'bx-user',
    subtitle: 'Add personal info',
  },
  {
    title: 'Social Links',
    icon: 'bx-link',
    subtitle: 'Add social links',
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="4"
    >
      <!-- 👉 Stepper -->
      <div class="pa-6">
        <AppStepper
          v-model:current-step="currentStep"
          direction="vertical"
          :items="numberedSteps"
          icon-size="24"
          class="stepper-icon-step-bg"
        />
      </div>
    </VCol>

    <!-- 👉 stepper content -->
    <VCol
      cols="12"
      md="8"
    >
      <VCard>
        <VCardText>
          <VForm>
            <VWindow
              v-model="currentStep"
              class="disable-tab-transition"
            >
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Account Details
                    </h6>
                    <p class="mb-0">
                      Enter your Account Details
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.username"
                      placeholder="CarterLeonardo"
                      label="Username"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.email"
                      placeholder="carterleonardo@gmail.com"
                      label="Email"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.password"
                      label="Password"
                      placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.cPassword"
                      label="Confirm Password"
                      placeholder="············"
                      :type="isCPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Personal Info
                    </h6>
                    <p class="mb-0">
                      Setup Information
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.firstName"
                      label="First Name"
                      placeholder="Leonard"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.lastName"
                      label="Last Name"
                      placeholder="Carter"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.country"
                      label="Country"
                      placeholder="Select Country"
                      :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.language"
                      label="Language"
                      placeholder="Select Language"
                      :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Social Links
                    </h6>
                    <p class="mb-0">
                      Add Social Links
                    </p>
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.twitter"
                      placeholder="https://twitter.com/abc"
                      label="Twitter"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.facebook"
                      placeholder="https://facebook.com/abc"
                      label="Facebook"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.googlePlus"
                      placeholder="https://plus.google.com/abc"
                      label="Google+"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.LinkedIn"
                      placeholder="https://linkedin.com/abc"
                      label="LinkedIn"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
            </VWindow>
            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>
              <VBtn
                v-if="numberedSteps.length - 1 === currentStep"
                color="success"
                @click="onSubmit"
              >
                submit
              </VBtn>
              <VBtn
                v-else
                @click="currentStep++"
              >
                Next
                <VIcon
                  icon="bx-right-arrow-alt"
                  end
                  class="flip-in-rtl"
                />
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
`},xe={ts:`<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)
const isCurrentStepValid = ref(true)
const refAccountForm = ref<VForm>()
const refPersonalForm = ref<VForm>()
const refSocialLinkForm = ref<VForm>()
const refAddressForm = ref<VForm>()

const accountForm = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
})

const personalForm = ref({
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
})

const socialForm = ref({
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',
})

const addressForm = ref({
  address: '',
  landmark: '',
  city: '',
  pincode: '',
})

const validateAccountForm = () => {
  refAccountForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    }
    else { isCurrentStepValid.value = false }
  })
}

const validatePersonalForm = () => {
  refPersonalForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    }
    else { isCurrentStepValid.value = false }
  })
}

const validateAddressForm = () => {
  refAddressForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    }
    else { isCurrentStepValid.value = false }
  })
}

const validateSocialLinkForm = () => {
  refSocialLinkForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    }
    else { isCurrentStepValid.value = false }
  })
}
<\/script>

<template>
  <VCard>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        :items="iconsSteps"
        :is-active-step-valid="isCurrentStepValid"
        align="center"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <!-- 👉 stepper content -->

      <VWindow
        v-model="currentStep"
        class="disable-tab-transition"
      >
        <VWindowItem>
          <VForm
            ref="refAccountForm"
            @submit.prevent="validateAccountForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.username"
                  placeholder="CarterLeonardo"
                  :rules="[requiredValidator]"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.email"
                  placeholder="carterleonardo@gmail.com"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.password"
                  placeholder="············"
                  label="Password"
                  :rules="[requiredValidator, passwordValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.cPassword"
                  placeholder="············"
                  label="Confirm Password"
                  :rules="[requiredValidator, confirmedValidator(accountForm.cPassword, accountForm.password)]"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    disabled
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refPersonalForm"
            @submit.prevent="validatePersonalForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="personalForm.firstName"
                  label="First Name"
                  :rules="[requiredValidator]"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="personalForm.lastName"
                  label="Last Name"
                  :rules="[requiredValidator]"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="personalForm.country"
                  label="Country"
                  :rules="[requiredValidator]"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="personalForm.language"
                  label="Language"
                  :rules="[requiredValidator]"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refAddressForm"
            @submit.prevent="validateAddressForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.address"
                  :rules="[requiredValidator]"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.landmark"
                  :rules="[requiredValidator]"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.pincode"
                  :rules="[requiredValidator]"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.city"
                  :rules="[requiredValidator]"
                  placeholder="New York"
                  label="City"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refSocialLinkForm"
            @submit.prevent="validateSocialLinkForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.twitter"
                  placeholder="https://twitter.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.facebook"
                  placeholder="https://facebook.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="LinkedIn"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <div class="text-base">
            <h6 class="text-base font-weight-medium mb-2">
              Account
            </h6>

            <p class="mb-1">
              {{ accountForm.username }}
            </p>
            <p class="mb-1">
              {{ accountForm.email }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Personal Info
            </h6>

            <p class="mb-1">
              {{ personalForm.firstName }}
            </p>
            <p class="mb-1">
              {{ personalForm.lastName }}
            </p>
            <p class="mb-1">
              {{ personalForm.country }}
            </p>
            <p class="mb-1">
              {{ personalForm.language }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Address
            </h6>

            <p class="mb-1">
              {{ addressForm.address }}
            </p>
            <p class="mb-1">
              {{ addressForm.landmark }}
            </p>
            <p class="mb-1">
              {{ addressForm.pincode }}
            </p>
            <p class="mb-1">
              {{ addressForm.city }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Social Links
            </h6>

            <p class="mb-1">
              {{ socialForm.twitter }}
            </p>
            <p class="mb-1">
              {{ socialForm.facebook }}
            </p>
            <p class="mb-1">
              {{ socialForm.googlePlus }}
            </p>
            <p class="mb-1">
              {{ socialForm.LinkedIn }}
            </p>
          </div>
          <VCol cols="12">
            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>

              <VBtn
                color="success"
                @click="console.log('Form Submitted')"
              >
                submit
              </VBtn>
            </div>
          </VCol>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
`,js:`<script setup>
import { VForm } from 'vuetify/components/VForm'
import customWizardAccount from '@images/svg/wizard-account.svg'
import customWizardAddress from '@images/svg/wizard-address.svg'
import customWizardPersonal from '@images/svg/wizard-personal.svg'
import customWizardSocialLink from '@images/svg/wizard-social-link.svg'
import customWizardSubmit from '@images/svg/wizard-submit.svg'

const iconsSteps = [
  {
    title: 'Account Details',
    icon: customWizardAccount,
  },
  {
    title: 'Personal Info',
    icon: customWizardPersonal,
  },
  {
    title: 'Address',
    icon: customWizardAddress,
  },
  {
    title: 'Social Links',
    icon: customWizardSocialLink,
  },
  {
    title: 'Review & Submit',
    icon: customWizardSubmit,
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)
const isCurrentStepValid = ref(true)
const refAccountForm = ref()
const refPersonalForm = ref()
const refSocialLinkForm = ref()
const refAddressForm = ref()

const accountForm = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
})

const personalForm = ref({
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
})

const socialForm = ref({
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',
})

const addressForm = ref({
  address: '',
  landmark: '',
  city: '',
  pincode: '',
})

const validateAccountForm = () => {
  refAccountForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}

const validatePersonalForm = () => {
  refPersonalForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}

const validateAddressForm = () => {
  refAddressForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}

const validateSocialLinkForm = () => {
  refSocialLinkForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}
<\/script>

<template>
  <VCard>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        :items="iconsSteps"
        :is-active-step-valid="isCurrentStepValid"
        align="center"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <!-- 👉 stepper content -->

      <VWindow
        v-model="currentStep"
        class="disable-tab-transition"
      >
        <VWindowItem>
          <VForm
            ref="refAccountForm"
            @submit.prevent="validateAccountForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Account Details
                </h6>
                <p class="mb-0">
                  Enter your Account Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.username"
                  placeholder="CarterLeonardo"
                  :rules="[requiredValidator]"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.email"
                  placeholder="carterleonardo@gmail.com"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.password"
                  placeholder="············"
                  label="Password"
                  :rules="[requiredValidator, passwordValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountForm.cPassword"
                  placeholder="············"
                  label="Confirm Password"
                  :rules="[requiredValidator, confirmedValidator(accountForm.cPassword, accountForm.password)]"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    disabled
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refPersonalForm"
            @submit.prevent="validatePersonalForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Personal Info
                </h6>
                <p class="mb-0">
                  Setup Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="personalForm.firstName"
                  label="First Name"
                  :rules="[requiredValidator]"
                  placeholder="Leonard"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="personalForm.lastName"
                  label="Last Name"
                  :rules="[requiredValidator]"
                  placeholder="Carter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="personalForm.country"
                  label="Country"
                  :rules="[requiredValidator]"
                  placeholder="Select Country"
                  :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="personalForm.language"
                  label="Language"
                  :rules="[requiredValidator]"
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refAddressForm"
            @submit.prevent="validateAddressForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Address
                </h6>
                <p class="mb-0">
                  Enter Your Address.
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.address"
                  :rules="[requiredValidator]"
                  placeholder="98 Borough bridge Road, Birmingham"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.landmark"
                  :rules="[requiredValidator]"
                  placeholder="Borough bridge"
                  label="Landmark"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.pincode"
                  :rules="[requiredValidator]"
                  placeholder="658921"
                  label="Pincode"
                  type="number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="addressForm.city"
                  :rules="[requiredValidator]"
                  placeholder="New York"
                  label="City"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refSocialLinkForm"
            @submit.prevent="validateSocialLinkForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Social Links
                </h6>
                <p class="mb-0">
                  Add Social Links
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.twitter"
                  placeholder="https://twitter.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Twitter"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.facebook"
                  placeholder="https://facebook.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Facebook"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.googlePlus"
                  placeholder="https://plus.google.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="Google+"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="socialForm.LinkedIn"
                  placeholder="https://linkedin.com/abc"
                  :rules="[requiredValidator, urlValidator]"
                  label="LinkedIn"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="bx-left-arrow-alt"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="bx-right-arrow-alt"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <div class="text-base">
            <h6 class="text-base font-weight-medium mb-2">
              Account
            </h6>

            <p class="mb-1">
              {{ accountForm.username }}
            </p>
            <p class="mb-1">
              {{ accountForm.email }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Personal Info
            </h6>

            <p class="mb-1">
              {{ personalForm.firstName }}
            </p>
            <p class="mb-1">
              {{ personalForm.lastName }}
            </p>
            <p class="mb-1">
              {{ personalForm.country }}
            </p>
            <p class="mb-1">
              {{ personalForm.language }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Address
            </h6>

            <p class="mb-1">
              {{ addressForm.address }}
            </p>
            <p class="mb-1">
              {{ addressForm.landmark }}
            </p>
            <p class="mb-1">
              {{ addressForm.pincode }}
            </p>
            <p class="mb-1">
              {{ addressForm.city }}
            </p>

            <VDivider class="my-4" />

            <h6 class="text-base font-weight-medium mb-2">
              Social Links
            </h6>

            <p class="mb-1">
              {{ socialForm.twitter }}
            </p>
            <p class="mb-1">
              {{ socialForm.facebook }}
            </p>
            <p class="mb-1">
              {{ socialForm.googlePlus }}
            </p>
            <p class="mb-1">
              {{ socialForm.LinkedIn }}
            </p>
          </div>
          <VCol cols="12">
            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>

              <VBtn
                color="success"
                @click="console.log('Form Submitted')"
              >
                submit
              </VBtn>
            </div>
          </VCol>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
`},Se={ts:`<script setup lang="ts">
const numberedSteps = [
  {
    title: 'Account Details',
    icon: 'bx-file',
    subtitle: 'Setup account details',
  },
  {
    title: 'Personal Info',
    icon: 'bx-user',
    subtitle: 'Add personal info',
  },
  {
    title: 'Social Links',
    icon: 'bx-link',
    subtitle: 'Add social links',
  },

]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',

})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VCard>
    <VRow>
      <VCol
        cols="12"
        md="4"
        :class="$vuetify.display.smAndDown ? 'border-b' : 'border-e'"
      >
        <VCardText>
          <!-- 👉 Stepper -->
          <AppStepper
            v-model:current-step="currentStep"
            direction="vertical"
            :items="numberedSteps"
            icon-size="24"
            class="stepper-icon-step-bg"
          />
        </VCardText>
      </VCol>
      <!-- 👉 stepper content -->
      <VCol
        cols="12"
        md="8"
      >
        <VCardText>
          <VForm>
            <VWindow
              v-model="currentStep"
              class="disable-tab-transition"
            >
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Account Details
                    </h6>
                    <p class="mb-0">
                      Enter your Account Details
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.username"
                      placeholder="CarterLeonardo"
                      label="Username"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.email"
                      placeholder="carterleonardo@gmail.com"
                      label="Email"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.password"
                      label="Password"
                      placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.cPassword"
                      label="Confirm Password"
                      placeholder="············"
                      :type="isCPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>

              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Personal Info
                    </h6>
                    <p class="mb-0">
                      Setup Information
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.firstName"
                      label="First Name"
                      placeholder="Leonard"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.lastName"
                      label="Last Name"
                      placeholder="Carter"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.country"
                      label="Country"
                      placeholder="Select Country"
                      :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.language"
                      label="Language"
                      placeholder="Select Language"
                      :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>

              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Social Links
                    </h6>
                    <p class="mb-0">
                      Add Social Links
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.twitter"
                      placeholder="https://twitter.com/abc"
                      label="Twitter"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.facebook"
                      placeholder="https://facebook.com/abc"
                      label="Facebook"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.googlePlus"
                      placeholder="https://plus.google.com/abc"
                      label="Google+"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.LinkedIn"
                      placeholder="https://linkedin.com/abc"
                      label="LinkedIn"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
            </VWindow>

            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>

              <VBtn
                v-if="numberedSteps.length - 1 === currentStep"
                color="success"
                @click="onSubmit"
              >
                submit
              </VBtn>

              <VBtn
                v-else
                @click="currentStep++"
              >
                Next

                <VIcon
                  icon="bx-right-arrow-alt"
                  end
                  class="flip-in-rtl"
                />
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>
`,js:`<script setup>
const numberedSteps = [
  {
    title: 'Account Details',
    icon: 'bx-file',
    subtitle: 'Setup account details',
  },
  {
    title: 'Personal Info',
    icon: 'bx-user',
    subtitle: 'Add personal info',
  },
  {
    title: 'Social Links',
    icon: 'bx-link',
    subtitle: 'Add social links',
  },
]

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  cPassword: '',
  firstName: '',
  lastName: '',
  country: undefined,
  language: undefined,
  twitter: '',
  facebook: '',
  googlePlus: '',
  LinkedIn: '',
})

const onSubmit = () => {
  console.log(formData.value)
}
<\/script>

<template>
  <VCard>
    <VRow>
      <VCol
        cols="12"
        md="4"
        :class="$vuetify.display.smAndDown ? 'border-b' : 'border-e'"
      >
        <VCardText>
          <!-- 👉 Stepper -->
          <AppStepper
            v-model:current-step="currentStep"
            direction="vertical"
            :items="numberedSteps"
            icon-size="24"
            class="stepper-icon-step-bg"
          />
        </VCardText>
      </VCol>
      <!-- 👉 stepper content -->
      <VCol
        cols="12"
        md="8"
      >
        <VCardText>
          <VForm>
            <VWindow
              v-model="currentStep"
              class="disable-tab-transition"
            >
              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Account Details
                    </h6>
                    <p class="mb-0">
                      Enter your Account Details
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.username"
                      placeholder="CarterLeonardo"
                      label="Username"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.email"
                      placeholder="carterleonardo@gmail.com"
                      label="Email"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.password"
                      label="Password"
                      placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.cPassword"
                      label="Confirm Password"
                      placeholder="············"
                      :type="isCPasswordVisible ? 'text' : 'password'"
                      :append-inner-icon="isCPasswordVisible ? 'bx-hide' : 'bx-show'"
                      @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>

              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Personal Info
                    </h6>
                    <p class="mb-0">
                      Setup Information
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.firstName"
                      label="First Name"
                      placeholder="Leonard"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.lastName"
                      label="Last Name"
                      placeholder="Carter"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.country"
                      label="Country"
                      placeholder="Select Country"
                      :items="['UK', 'USA', 'Canada', 'Australia', 'Germany']"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppSelect
                      v-model="formData.language"
                      label="Language"
                      placeholder="Select Language"
                      :items="['English', 'Spanish', 'French', 'Russian', 'German']"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>

              <VWindowItem>
                <VRow>
                  <VCol cols="12">
                    <h6 class="text-h6 font-weight-medium">
                      Social Links
                    </h6>
                    <p class="mb-0">
                      Add Social Links
                    </p>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.twitter"
                      placeholder="https://twitter.com/abc"
                      label="Twitter"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.facebook"
                      placeholder="https://facebook.com/abc"
                      label="Facebook"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.googlePlus"
                      placeholder="https://plus.google.com/abc"
                      label="Google+"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.LinkedIn"
                      placeholder="https://linkedin.com/abc"
                      label="LinkedIn"
                    />
                  </VCol>
                </VRow>
              </VWindowItem>
            </VWindow>

            <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="bx-left-arrow-alt"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>

              <VBtn
                v-if="numberedSteps.length - 1 === currentStep"
                color="success"
                @click="onSubmit"
              >
                submit
              </VBtn>

              <VBtn
                v-else
                @click="currentStep++"
              >
                Next

                <VIcon
                  icon="bx-right-arrow-alt"
                  end
                  class="flip-in-rtl"
                />
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>
`},ke={xmlns:"http://www.w3.org/2000/svg",width:"54",height:"54"},Ae=r("g",{fill:"currentColor"},[r("path",{d:"M54 7.2V4a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v3.2h1.8v36H.9a.9.9 0 1 0 0 1.8h25.2v1.8c0 .042.019.08.024.12A3.596 3.596 0 0 0 23.4 50.4c0 1.985 1.615 3.6 3.6 3.6s3.6-1.615 3.6-3.6a3.596 3.596 0 0 0-2.724-3.48c.005-.04.024-.078.024-.12V45h25.2a.9.9 0 1 0 0-1.8h-.9v-36zM28.8 50.4c0 .993-.807 1.8-1.8 1.8s-1.8-.807-1.8-1.8.807-1.8 1.8-1.8 1.8.807 1.8 1.8M5.4 1.8h43.2a3.6 3.6 0 0 1 3.6 3.6H1.8a3.6 3.6 0 0 1 3.6-3.6m43 41.4H5.6a2 2 0 0 1-2-2v-32a2 2 0 0 1 2-2h42.8a2 2 0 0 1 2 2v32a2 2 0 0 1-2 2"}),r("path",{d:"M45 36.9H31.5a.9.9 0 1 0 0 1.8H45a.9.9 0 1 0 0-1.8M9 32.4h9a.9.9 0 1 0 0-1.8H9a.9.9 0 1 0 0 1.8m18 0h13.5a.9.9 0 1 0 0-1.8H27a.9.9 0 1 0 0 1.8m-5.139-1.539a.93.93 0 0 0-.261.639c0 .234.099.468.261.639a.95.95 0 0 0 .639.261.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.95.95 0 0 0-.261-.639c-.333-.333-.945-.333-1.278 0M27 36.9H13.5a.9.9 0 1 0 0 1.8H27a.9.9 0 1 0 0-1.8M9 38.7a.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.9.9 0 0 0-.261-.63c-.333-.342-.936-.342-1.278-.009a.95.95 0 0 0-.261.639c0 .234.099.468.261.639A.95.95 0 0 0 9 38.7m35.361-7.839a.93.93 0 0 0-.261.639c0 .234.099.468.261.639A.95.95 0 0 0 45 32.4a.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.95.95 0 0 0-.261-.639c-.333-.333-.936-.333-1.278 0M45 18H31.5a.9.9 0 1 0 0 1.8H45a.9.9 0 1 0 0-1.8m0 6.3h-9a.9.9 0 1 0 0 1.8h9a.9.9 0 1 0 0-1.8m-18 1.8h1.8a.9.9 0 1 0 0-1.8H27a.9.9 0 1 0 0 1.8m0-12.6h13.5a.9.9 0 1 0 0-1.8H27a.9.9 0 1 0 0 1.8m18 0a.95.95 0 0 0 .639-.261.9.9 0 0 0 .261-.639.9.9 0 0 0-.261-.639c-.342-.333-.945-.333-1.278 0a.95.95 0 0 0-.261.639c0 .234.099.468.261.639A.95.95 0 0 0 45 13.5m-17.739 4.761A.93.93 0 0 0 27 18.9c0 .234.099.468.261.639a.95.95 0 0 0 .639.261.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.93.93 0 0 0-.261-.639.94.94 0 0 0-1.278 0m4.5 6.3a.95.95 0 0 0-.261.639c0 .234.099.468.261.639a.95.95 0 0 0 .639.261.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.95.95 0 0 0-.261-.639c-.333-.333-.945-.333-1.278 0M19.5 11.7h-8.4a3 3 0 0 0-3 3v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3v-8.4a3 3 0 0 0-3-3m-1.8 12.6h-4.8a3 3 0 0 1-3-3v-4.8a3 3 0 0 1 3-3h4.8a3 3 0 0 1 3 3v4.8a3 3 0 0 1-3 3"})],-1),Fe=[Ae];function ye(D,x){return S(),U("svg",ke,[...Fe])}const H={render:ye},Pe={xmlns:"http://www.w3.org/2000/svg",width:"54",height:"54"},_e=te('<g fill="currentColor"><path d="M54 3.864c0-1.986-1.615-3.6-3.6-3.6H3.6a3.604 3.604 0 0 0-3.6 3.6c0 1.673 1.152 3.07 2.7 3.472v43.7l2.7-2.7 5.4 5.4 5.4-5.4 5.4 5.4 5.4-5.4 5.4 5.4 5.4-5.4 5.4 5.4 5.4-5.4 2.7 2.7v-43.7c1.548-.402 2.7-1.8 2.7-3.472M49.5 46.69l-.9-.9-5.4 5.4-5.4-5.4-5.4 5.4-5.4-5.4-5.4 5.4-5.4-5.4-5.4 5.4-5.4-5.4-.9.9V4.764h45zm1.8-41.27V2.965H2.7v2.458a1.8 1.8 0 0 1 .9-3.358h46.8a1.8 1.8 0 0 1 .9 3.358z"></path><path d="M39.6 36.264H26.1a.9.9 0 1 0 0 1.8h13.5a.9.9 0 1 0 0-1.8m3.861.261a.93.93 0 0 0-.261.639c0 .234.099.468.261.639a.95.95 0 0 0 .639.26.95.95 0 0 0 .639-.26.95.95 0 0 0 .261-.64.93.93 0 0 0-.261-.638.94.94 0 0 0-1.278 0m.639-12.861H30.6a.9.9 0 1 0 0 1.8h13.5a.9.9 0 1 0 0-1.8m0 6.3h-9a.9.9 0 1 0 0 1.8h9a.9.9 0 1 0 0-1.8m-18.9.9a.9.9 0 0 0 .9.9h1.8a.9.9 0 1 0 0-1.8h-1.8a.9.9 0 0 0-.9.9m15.3-12.6a.9.9 0 0 0-.9-.9H26.1a.9.9 0 1 0 0 1.8h13.5a.9.9 0 0 0 .9-.9m2.961-.639a.93.93 0 0 0-.261.639c0 .234.099.468.261.639a.95.95 0 0 0 .639.26.93.93 0 0 0 .639-.26.95.95 0 0 0 .261-.64.95.95 0 0 0-.261-.638c-.333-.333-.945-.333-1.278 0m-15.822 7.578a.93.93 0 0 0 .261-.64.93.93 0 0 0-.261-.638c-.333-.333-.936-.333-1.278 0a.93.93 0 0 0-.261.639.93.93 0 0 0 .261.639.95.95 0 0 0 .639.26.95.95 0 0 0 .639-.26m4.5 6.3a.91.91 0 0 0 0-1.278c-.333-.333-.936-.333-1.278 0a.95.95 0 0 0-.261.639c0 .234.099.468.261.639a.95.95 0 0 0 .639.26.95.95 0 0 0 .639-.26M15.3 19.255v-.991a.9.9 0 1 0-1.8 0v.993c-.982.2-1.877.721-2.536 1.502a3.1 3.1 0 0 0-.715 2.342 3.28 3.28 0 0 0 1.245 2.242l2.006 1.56v4.895a2.7 2.7 0 0 1-1.8-2.534.9.9 0 1 0-1.8 0 4.51 4.51 0 0 0 3.6 4.409v.79a.9.9 0 1 0 1.8 0v-.794c.982-.2 1.877-.72 2.537-1.501a3.1 3.1 0 0 0 .714-2.345 3.28 3.28 0 0 0-1.245-2.239l-2.006-1.56V21.13a2.7 2.7 0 0 1 1.8 2.535.9.9 0 1 0 1.8 0 4.51 4.51 0 0 0-3.6-4.41m.9 9.75c.315.244.52.612.56 1.006.04.37-.067.723-.297.995a2.7 2.7 0 0 1-1.163.787v-3.49zm-3.6-5.082a1.48 1.48 0 0 1-.56-1.008 1.32 1.32 0 0 1 .297-.994 2.7 2.7 0 0 1 1.163-.787v3.49z"></path><circle cx="36" cy="10.164" r="1"></circle><circle cx="32.4" cy="10.164" r="1"></circle><circle cx="39.6" cy="10.164" r="1"></circle><circle cx="28.8" cy="10.164" r="1"></circle><circle cx="43.2" cy="10.164" r="1"></circle><circle cx="18" cy="10.164" r="1"></circle><circle cx="21.6" cy="10.164" r="1"></circle><circle cx="25.2" cy="10.164" r="1"></circle><circle cx="46.8" cy="10.164" r="1"></circle><circle cx="14.4" cy="10.164" r="1"></circle><circle cx="10.8" cy="10.164" r="1"></circle><circle cx="7.2" cy="10.164" r="1"></circle></g>',1),De=[_e];function Ie(D,x){return S(),U("svg",Pe,[...De])}const K={render:Ie},Le={xmlns:"http://www.w3.org/2000/svg",width:"58",height:"54"},Te=r("g",{fill:"currentColor"},[r("path",{d:"M53.857.283H4a4 4 0 0 0-4 4V40.64a4 4 0 0 0 4 4h32.643v9.077l6.75-6.75 6.75 6.75V44.64h3.714a4 4 0 0 0 4-4V4.283a4 4 0 0 0-4-4m-5.643 48.779-4.821-4.822-4.822 4.822V38.517q.02.01.037.019a9.6 9.6 0 0 0 4.785 1.282 9.6 9.6 0 0 0 4.785-1.282c.011-.007.025-.01.036-.019zm.283-13.118q-.228.2-.467.38a8 8 0 0 1-.58.4q-.058.034-.114.07a7 7 0 0 1-.496.272l-.145.07q-.242.117-.492.216-.096.036-.193.07-.233.086-.472.157-.128.036-.259.067a7 7 0 0 1-.43.1c-.123.024-.248.04-.373.057-.114.016-.227.037-.343.047a8 8 0 0 1-.741.038 8 8 0 0 1-.742-.038c-.114-.011-.227-.03-.342-.047q-.187-.024-.373-.057c-.145-.028-.288-.065-.43-.1q-.13-.032-.26-.067a7 7 0 0 1-.471-.157q-.098-.034-.193-.07a8 8 0 0 1-1.133-.559 8 8 0 0 1-.602-.4l-.092-.068a7.7 7.7 0 0 1-3.075-6.15c0-4.253 3.46-7.714 7.714-7.714 4.253 0 7.714 3.46 7.714 7.714a7.69 7.69 0 0 1-2.61 5.769m3.432 6.767h-1.786V37.05a9.6 9.6 0 0 0 2.893-6.875c0-5.317-4.326-9.642-9.643-9.642s-9.643 4.325-9.643 9.642a9.6 9.6 0 0 0 2.893 6.875v5.661H5.929a4 4 0 0 1-4-4v-32.5a4 4 0 0 1 4-4h46a4 4 0 0 1 4 4v32.5a4 4 0 0 1-4 4"}),r("path",{d:"M11.747 12.598a3.32 3.32 0 0 0-.766 2.51c.099.944.585 1.82 1.334 2.402l2.15 1.673v5.243a2.89 2.89 0 0 1-1.93-2.715.964.964 0 1 0-1.928 0 4.83 4.83 0 0 0 3.857 4.724v.847a.964.964 0 1 0 1.929 0v-.85a4.8 4.8 0 0 0 2.718-1.61c.59-.697.861-1.588.765-2.511a3.52 3.52 0 0 0-1.334-2.4l-2.15-1.67v-5.244a2.89 2.89 0 0 1 1.93 2.715.964.964 0 1 0 1.928 0 4.83 4.83 0 0 0-3.857-4.724V9.926a.964.964 0 1 0-1.929 0v1.065a4.8 4.8 0 0 0-2.717 1.607m5.611 8.836c.337.261.556.656.6 1.078.041.396-.072.775-.32 1.066a2.9 2.9 0 0 1-1.245.844v-3.74zM13.5 15.99a1.58 1.58 0 0 1-.6-1.08 1.4 1.4 0 0 1 .32-1.065 2.87 2.87 0 0 1 1.245-.843v3.738zm10.607-1.243h22.179a.964.964 0 1 0 0-1.929H24.107a.964.964 0 1 0 0 1.929m0 5.786h10.607a.964.964 0 1 0 0-1.929H24.107a.964.964 0 1 0 0 1.929m0 5.785h7.714a.964.964 0 1 0 0-1.928h-7.714a.964.964 0 1 0 0 1.928m-13.5 6.75h20.25a.964.964 0 1 0 0-1.928h-20.25a.964.964 0 1 0 0 1.928"})],-1),We=[Te];function Ne(D,x){return S(),U("svg",Le,[...We])}const J={render:Ne},Be={xmlns:"http://www.w3.org/2000/svg",width:"54",height:"54"},Ue=r("g",{fill:"currentColor"},[r("path",{d:"M50 3.6H27.9V.9a.9.9 0 1 0-1.8 0v2.7H4a4 4 0 0 0-4 4v29.8a4 4 0 0 0 4 4h20.827L13.764 52.464a.899.899 0 1 0 1.272 1.272L26.1 42.673V51.3a.9.9 0 1 0 1.8 0v-8.627l11.064 11.063a.9.9 0 0 0 1.272 0 .9.9 0 0 0 0-1.272L29.173 41.4H50a4 4 0 0 0 4-4V7.6a4 4 0 0 0-4-4m-1.8 36H5.8a4 4 0 0 1-4-4V9.4a4 4 0 0 1 4-4h42.4a4 4 0 0 1 4 4v26.2a4 4 0 0 1-4 4"}),r("path",{d:"M32.4 37.8a.9.9 0 0 0 .9-.9v-2.7a.9.9 0 1 0-1.8 0v2.7a.9.9 0 0 0 .9.9m3.6-8.1a.9.9 0 0 0-.9.9v6.3a.9.9 0 1 0 1.8 0v-6.3a.9.9 0 0 0-.9-.9m3.6 1.8a.9.9 0 0 0-.9.9v4.5a.9.9 0 1 0 1.8 0v-4.5a.9.9 0 0 0-.9-.9m3.6-6.3a.9.9 0 0 0-.9.9v10.8a.9.9 0 1 0 1.8 0V26.1a.9.9 0 0 0-.9-.9m3.6 3.6a.9.9 0 0 0-.9.9v7.2a.9.9 0 1 0 1.8 0v-7.2a.9.9 0 0 0-.9-.9M7.2 34.2h9a.9.9 0 1 0 0-1.8h-9a.9.9 0 1 0 0 1.8M20.7 36H7.2a.9.9 0 1 0 0 1.8h13.5a.9.9 0 1 0 0-1.8m6.26-19.254a10 10 0 0 0-.073-.637q-.025-.192-.058-.382a11 11 0 0 0-.153-.7q-.037-.156-.08-.311a10 10 0 0 0-.232-.704q-.052-.15-.11-.297a10 10 0 0 0-.285-.636c-.053-.112-.104-.225-.162-.335a10 10 0 0 0-.296-.513c-.082-.137-.16-.275-.249-.409q-.122-.174-.25-.344c-.124-.171-.245-.344-.38-.508l-.002-.002c-.21-.254-.428-.502-.663-.737a10 10 0 0 0-.706-.634l-.035-.032c-.155-.128-.32-.242-.481-.36-.123-.092-.245-.187-.375-.273-.122-.08-.25-.152-.375-.228a10 10 0 0 0-.55-.318c-.099-.051-.2-.096-.3-.145a10 10 0 0 0-.674-.301q-.134-.05-.266-.097a11 11 0 0 0-.732-.242q-.146-.039-.294-.075a10 10 0 0 0-.71-.156q-.191-.033-.384-.058a11 11 0 0 0-.63-.072 10 10 0 0 0-.487-.024c-.107-.003-.21-.016-.318-.016-.081 0-.16.01-.241.013-.08.001-.158-.006-.238-.002l-.355.021-.01.01C10.495 7.674 6.3 12.127 6.3 17.55c0 5.707 4.643 10.35 10.35 10.35 2.591 0 4.957-.964 6.775-2.544.025-.02.056-.03.08-.053.014-.014.018-.033.032-.048a10.32 10.32 0 0 0 3.419-6.817l.017-.014.018-.396c.004-.08-.004-.157-.002-.236 0-.08.011-.16.011-.242 0-.11-.014-.217-.016-.326q-.007-.239-.025-.478zM17.1 9.023q.136.004.268.013a9 9 0 0 1 .886.12q.09.015.18.034.369.077.724.186l.044.013a8.59 8.59 0 0 1 5.61 5.609q.005.022.012.044.109.355.186.723.019.09.034.181a9 9 0 0 1 .12.886q.009.133.013.268H17.1zm-9 8.527c0-4.254 3.127-7.782 7.2-8.433v8.878l.002.012.031.893h.494l5.68 5.679A8.5 8.5 0 0 1 16.65 26.1c-4.714 0-8.55-3.836-8.55-8.55m14.77 5.847L18.373 18.9h6.71a8.5 8.5 0 0 1-2.213 4.497M35.1 13.5h7.2a.9.9 0 1 0 0-1.8h-7.2a.9.9 0 1 0 0 1.8m11.07-1.539a.88.88 0 0 0-.27.639c0 .243.098.477.261.63.17.171.395.27.639.27a.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.95.95 0 0 0-.261-.639c-.342-.333-.955-.324-1.269 0M44.1 9h2.7a.9.9 0 1 0 0-1.8h-2.7a.9.9 0 1 0 0 1.8m-9 0h1.8a.9.9 0 1 0 0-1.8h-1.8a.9.9 0 1 0 0 1.8m5.4 0a.93.93 0 0 0 .639-.261.93.93 0 0 0 .261-.639.93.93 0 0 0-.261-.639c-.333-.333-.955-.333-1.278 0a.92.92 0 0 0-.261.639c0 .243.098.468.261.639.17.162.395.261.639.261"})],-1),$e=[Ue];function ze(D,x){return S(),U("svg",Be,[...$e])}const Y={render:ze},Re={xmlns:"http://www.w3.org/2000/svg",width:"54",height:"54"},qe=r("g",{fill:"currentColor"},[r("path",{d:"M50.4 13.5V2.687A2.69 2.69 0 0 0 47.714 0h-3.627A2.69 2.69 0 0 0 41.4 2.687V13.5H4a4 4 0 0 0-4 4v21.7a4 4 0 0 0 4 4h37.4v2.04l3.6 6.3v1.56a.9.9 0 1 0 1.8 0v-1.56l3.6-6.3V43.2a3.6 3.6 0 0 0 3.6-3.6V17.1a3.6 3.6 0 0 0-3.6-3.6m-1.8-3.6h-5.4V8.1h5.4zm-5.4-7.213c0-.49.398-.887.886-.887h3.628c.488 0 .886.398.886.887V6.3h-5.4zM1.8 38.4V18.3a3 3 0 0 1 3-3h33.6a3 3 0 0 1 3 3v20.1a3 3 0 0 1-3 3H4.8a3 3 0 0 1-3-3m44.1 11.086L43.85 45.9h4.1zm2.7-5.386h-5.4V11.7h5.4zm2.7-2.7a.9.9 0 0 1-.9-.9V16.2a.9.9 0 1 1 1.8 0v24.3a.9.9 0 0 1-.9.9"}),r("path",{d:"M35.1 23.4h-2.7a.9.9 0 1 0 0 1.8h2.7a.9.9 0 1 0 0-1.8m-16.2-1.8h2.7a.9.9 0 1 0 0-1.8h-2.7a.9.9 0 1 0 0 1.8m16.2-1.8h-6.3a.9.9 0 1 0 0 1.8h6.3a.9.9 0 1 0 0-1.8m-9.9 1.8a.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.95.95 0 0 0-.261-.639c-.342-.333-.945-.333-1.278 0a.95.95 0 0 0-.261.639c0 .234.099.468.261.639a.93.93 0 0 0 .639.261m-3.6 2.7a.9.9 0 0 0 .9.9h6.3a.9.9 0 1 0 0-1.8h-6.3a.9.9 0 0 0-.9.9m-2.7.9a.95.95 0 0 0 .639-.261.95.95 0 0 0 .261-.639.93.93 0 0 0-.261-.639c-.342-.333-.945-.333-1.278 0A.93.93 0 0 0 18 24.3c0 .234.099.468.261.639a.93.93 0 0 0 .639.261m-9-4.41v-.99a.9.9 0 1 0-1.8 0v.994c-.982.2-1.877.721-2.536 1.502a3.1 3.1 0 0 0-.715 2.342 3.28 3.28 0 0 0 1.245 2.242L8.1 28.44v4.894A2.7 2.7 0 0 1 6.3 30.8a.9.9 0 1 0-1.8 0 4.51 4.51 0 0 0 3.6 4.409V36a.9.9 0 1 0 1.8 0v-.794c.982-.2 1.877-.72 2.537-1.501a3.1 3.1 0 0 0 .714-2.345 3.28 3.28 0 0 0-1.245-2.239L9.9 27.56v-4.894a2.7 2.7 0 0 1 1.8 2.534.9.9 0 1 0 1.8 0 4.51 4.51 0 0 0-3.6-4.41m.9 9.752c.315.243.52.611.56 1.006.04.369-.067.722-.297.994-.313.37-.718.63-1.163.788v-3.49l.9.701zm-3.6-5.083a1.48 1.48 0 0 1-.56-1.008c-.038-.368.067-.72.297-.993.313-.37.718-.63 1.163-.788v3.49l-.9-.7zm14.53 4.601c-1.97 1.026-2.635 2.989-2.876 5.024l-1.117-.936c-.882-.74-2.162.527-1.272 1.272l2.525 2.116c.592.497 1.51.183 1.536-.636.066-1.95.158-4.268 2.114-5.286 1.026-.534.117-2.089-.91-1.554m5.985 3.59c-1.246.289-2.664 1.875-3.542.096-.512-1.04-2.065-.128-1.554.908.465.944 1.35 1.604 2.402 1.737a3 3 0 0 0 1.52-.203c.367-.143 1.742-1.176 2.04-.645.565 1.011 2.12.104 1.554-.908-.484-.865-1.462-1.207-2.42-.985"})],-1),je=[qe];function Ee(D,x){return S(),U("svg",Re,[...je])}const O={render:Ee},Ge=r("h6",{class:"text-h6 font-weight-medium"}," Account Details ",-1),Me=r("p",{class:"mb-0"}," Enter your Account Details ",-1),He=r("h6",{class:"text-h6 font-weight-medium"}," Personal Info ",-1),Ke=r("p",{class:"mb-0"}," Setup Information ",-1),Je=r("h6",{class:"text-h6 font-weight-medium"}," Address ",-1),Ye=r("p",{class:"mb-0"}," Enter Your Address. ",-1),Oe=r("h6",{class:"text-h6 font-weight-medium"}," Social Links ",-1),Qe=r("p",{class:"mb-0"}," Add Social Links ",-1),Xe={class:"text-base"},Ze=r("h6",{class:"text-base font-weight-medium mb-2"}," Account ",-1),el={class:"mb-1"},ll={class:"mb-1"},ol=r("h6",{class:"text-base font-weight-medium mb-2"}," Personal Info ",-1),al={class:"mb-1"},tl={class:"mb-1"},sl={class:"mb-1"},rl={class:"mb-1"},il=r("h6",{class:"text-base font-weight-medium mb-2"}," Address ",-1),dl={class:"mb-1"},nl={class:"mb-1"},cl={class:"mb-1"},ml={class:"mb-1"},pl=r("h6",{class:"text-base font-weight-medium mb-2"}," Social Links ",-1),ul={class:"mb-1"},Vl={class:"mb-1"},bl={class:"mb-1"},fl={class:"mb-1"},hl={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},wl=$({__name:"DemoFormWizardIconsBasic",setup(D){const x=[{title:"Account Details",icon:H},{title:"Personal Info",icon:J},{title:"Address",icon:K},{title:"Social Links",icon:Y},{title:"Review & Submit",icon:O}],n=b(0),V=b(!1),f=b(!1),t=b({username:"johndoe",email:"john.doe@email.com",password:"johndoe@J2",cPassword:"johndoe@J2",firstName:"John",lastName:"Doe",country:"UK",language:"English",address:"98 Borough bridge Road, Birmingham",landmark:"Borough bridge",pincode:"658921",city:"Birmingham",twitter:"https://twitter.com/abc",facebook:"https://facebook.com/abc",googlePlus:"https://plus.google.com/abc",linkedIn:"https://linkedin.com/abc"}),I=()=>{console.log(t.value)};return(B,a)=>{const L=q,d=R,h=z;return S(),_(j,null,{default:o(()=>[e(N,null,{default:o(()=>[e(L,{"current-step":l(n),"onUpdate:currentStep":a[0]||(a[0]=s=>T(n)?n.value=s:null),items:x,align:"center"},null,8,["current-step"])]),_:1}),e(P),e(N,null,{default:o(()=>[e(W,null,{default:o(()=>[e(E,{modelValue:l(n),"onUpdate:modelValue":a[19]||(a[19]=s=>T(n)?n.value=s:null),class:"disable-tab-transition"},{default:o(()=>[e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Ge,Me]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).username,"onUpdate:modelValue":a[1]||(a[1]=s=>l(t).username=s),placeholder:"CarterLeonardo",label:"Username"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).email,"onUpdate:modelValue":a[2]||(a[2]=s=>l(t).email=s),placeholder:"carterleonardo@gmail.com",label:"Email"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).password,"onUpdate:modelValue":a[3]||(a[3]=s=>l(t).password=s),label:"Password",placeholder:"············",type:l(V)?"text":"password","append-inner-icon":l(V)?"bx-hide":"bx-show","onClick:appendInner":a[4]||(a[4]=s=>V.value=!l(V))},null,8,["modelValue","type","append-inner-icon"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).cPassword,"onUpdate:modelValue":a[5]||(a[5]=s=>l(t).cPassword=s),label:"Confirm Password",placeholder:"············",type:l(f)?"text":"password","append-inner-icon":l(f)?"bx-hide":"bx-show","onClick:appendInner":a[6]||(a[6]=s=>f.value=!l(f))},null,8,["modelValue","type","append-inner-icon"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[He,Ke]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).firstName,"onUpdate:modelValue":a[7]||(a[7]=s=>l(t).firstName=s),label:"First Name",placeholder:"Leonard"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).lastName,"onUpdate:modelValue":a[8]||(a[8]=s=>l(t).lastName=s),label:"Last Name",placeholder:"Carter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).country,"onUpdate:modelValue":a[9]||(a[9]=s=>l(t).country=s),label:"Country",placeholder:"Select Country",items:["UK","USA","Canada","Australia","Germany"]},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).language,"onUpdate:modelValue":a[10]||(a[10]=s=>l(t).language=s),label:"Language",placeholder:"Select Language",items:["English","Spanish","French","Russian","German"]},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Je,Ye]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).address,"onUpdate:modelValue":a[11]||(a[11]=s=>l(t).address=s),placeholder:"98 Borough bridge Road, Birmingham",label:"Address"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).landmark,"onUpdate:modelValue":a[12]||(a[12]=s=>l(t).landmark=s),placeholder:"Borough bridge",label:"Landmark"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).pincode,"onUpdate:modelValue":a[13]||(a[13]=s=>l(t).pincode=s),placeholder:"658921",label:"Pincode",type:"number"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).city,"onUpdate:modelValue":a[14]||(a[14]=s=>l(t).city=s),placeholder:"New York",label:"City"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Oe,Qe]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).twitter,"onUpdate:modelValue":a[15]||(a[15]=s=>l(t).twitter=s),placeholder:"https://twitter.com/abc",label:"Twitter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).facebook,"onUpdate:modelValue":a[16]||(a[16]=s=>l(t).facebook=s),placeholder:"https://facebook.com/abc",label:"Facebook"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).googlePlus,"onUpdate:modelValue":a[17]||(a[17]=s=>l(t).googlePlus=s),placeholder:"https://plus.google.com/abc",label:"Google+"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).linkedIn,"onUpdate:modelValue":a[18]||(a[18]=s=>l(t).linkedIn=s),placeholder:"https://linkedin.com/abc",label:"LinkedIn"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[r("div",Xe,[Ze,r("p",el,u(l(t).username),1),r("p",ll,u(l(t).email),1),e(P,{class:"my-4"}),ol,r("p",al,u(l(t).firstName),1),r("p",tl,u(l(t).lastName),1),r("p",sl,u(l(t).country),1),r("p",rl,u(l(t).language),1),e(P,{class:"my-4"}),il,r("p",dl,u(l(t).address),1),r("p",nl,u(l(t).landmark),1),r("p",cl,u(l(t).pincode),1),r("p",ml,u(l(t).city),1),e(P,{class:"my-4"}),pl,r("p",ul,u(l(t).twitter),1),r("p",Vl,u(l(t).facebook),1),r("p",bl,u(l(t).googlePlus),1),r("p",fl,u(l(t).linkedIn),1)])]),_:1})]),_:1},8,["modelValue"]),r("div",hl,[e(w,{color:"secondary",variant:"tonal",disabled:l(n)===0,onClick:a[20]||(a[20]=s=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1},8,["disabled"]),x.length-1===l(n)?(S(),_(w,{key:0,color:"success",onClick:I},{default:o(()=>[g(" submit ")]),_:1})):(S(),_(w,{key:1,onClick:a[21]||(a[21]=s=>n.value++)},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1}))])]),_:1})]),_:1})]),_:1})}}}),gl={class:"mb-6"},vl=r("h6",{class:"text-h6 font-weight-medium"}," Account Details ",-1),Cl=r("p",{class:"mb-0"}," Enter your Account Details ",-1),xl=r("h6",{class:"text-h6 font-weight-medium"}," Personal Info ",-1),Sl=r("p",{class:"mb-0"}," Setup Information ",-1),kl=r("h6",{class:"text-h6 font-weight-medium"}," Address ",-1),Al=r("p",{class:"mb-0"}," Enter Your Address. ",-1),Fl=r("h6",{class:"text-h6 font-weight-medium"}," Social Links ",-1),yl=r("p",{class:"mb-0"}," Add Social Links ",-1),Pl={class:"text-base"},_l=r("h6",{class:"text-base font-weight-medium mb-2"}," Account ",-1),Dl={class:"mb-1"},Il={class:"mb-1"},Ll=r("h6",{class:"text-base font-weight-medium mb-2"}," Personal Info ",-1),Tl={class:"mb-1"},Wl={class:"mb-1"},Nl={class:"mb-1"},Bl={class:"mb-1"},Ul=r("h6",{class:"text-base font-weight-medium mb-2"}," Address ",-1),$l={class:"mb-1"},zl={class:"mb-1"},Rl={class:"mb-1"},ql={class:"mb-1"},jl=r("h6",{class:"text-base font-weight-medium mb-2"}," Social Links ",-1),El={class:"mb-1"},Gl={class:"mb-1"},Ml={class:"mb-1"},Hl={class:"mb-1"},Kl={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},Jl=$({__name:"DemoFormWizardIconsModernBasic",setup(D){const x=[{title:"Account Details",icon:H},{title:"Personal Info",icon:J},{title:"Address",icon:K},{title:"Social Links",icon:Y},{title:"Review & Submit",icon:O}],n=b(0),V=b(!1),f=b(!1),t=b({username:"johndoe",email:"john.doe@email.com",password:"johndoe@J2",cPassword:"johndoe@J2",firstName:"John",lastName:"Doe",country:"UK",language:"English",address:"98 Borough bridge Road, Birmingham",landmark:"Borough bridge",pincode:"658921",city:"Birmingham",twitter:"https://twitter.com/abc",facebook:"https://facebook.com/abc",googlePlus:"https://plus.google.com/abc",linkedIn:"https://linkedin.com/abc"}),I=()=>{console.log(t.value)};return(B,a)=>{const L=q,d=R,h=z;return S(),U(X,null,[r("div",gl,[e(L,{"current-step":l(n),"onUpdate:currentStep":a[0]||(a[0]=s=>T(n)?n.value=s:null),items:x},null,8,["current-step"])]),e(j,null,{default:o(()=>[e(N,null,{default:o(()=>[e(W,null,{default:o(()=>[e(E,{modelValue:l(n),"onUpdate:modelValue":a[19]||(a[19]=s=>T(n)?n.value=s:null),class:"disable-tab-transition"},{default:o(()=>[e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[vl,Cl]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).username,"onUpdate:modelValue":a[1]||(a[1]=s=>l(t).username=s),placeholder:"CarterLeonardo",label:"Username"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).email,"onUpdate:modelValue":a[2]||(a[2]=s=>l(t).email=s),placeholder:"carterleonardo@gmail.com",label:"Email"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).password,"onUpdate:modelValue":a[3]||(a[3]=s=>l(t).password=s),label:"Password",placeholder:"············",type:l(V)?"text":"password","append-inner-icon":l(V)?"bx-hide":"bx-show","onClick:appendInner":a[4]||(a[4]=s=>V.value=!l(V))},null,8,["modelValue","type","append-inner-icon"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).cPassword,"onUpdate:modelValue":a[5]||(a[5]=s=>l(t).cPassword=s),label:"Confirm Password",placeholder:"············",type:l(f)?"text":"password","append-inner-icon":l(f)?"bx-hide":"bx-show","onClick:appendInner":a[6]||(a[6]=s=>f.value=!l(f))},null,8,["modelValue","type","append-inner-icon"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[xl,Sl]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).firstName,"onUpdate:modelValue":a[7]||(a[7]=s=>l(t).firstName=s),label:"First Name",placeholder:"Leonard"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).lastName,"onUpdate:modelValue":a[8]||(a[8]=s=>l(t).lastName=s),label:"Last Name",placeholder:"Carter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).country,"onUpdate:modelValue":a[9]||(a[9]=s=>l(t).country=s),label:"Country",placeholder:"Select Country",items:["UK","USA","Canada","Australia","Germany"]},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).language,"onUpdate:modelValue":a[10]||(a[10]=s=>l(t).language=s),label:"Language",placeholder:"Select Language",items:["English","Spanish","French","Russian","German"]},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[kl,Al]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).address,"onUpdate:modelValue":a[11]||(a[11]=s=>l(t).address=s),placeholder:"98 Borough bridge Road, Birmingham",label:"Address"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).landmark,"onUpdate:modelValue":a[12]||(a[12]=s=>l(t).landmark=s),placeholder:"Borough bridge",label:"Landmark"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).pincode,"onUpdate:modelValue":a[13]||(a[13]=s=>l(t).pincode=s),placeholder:"658921",label:"Pincode",type:"number"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).city,"onUpdate:modelValue":a[14]||(a[14]=s=>l(t).city=s),placeholder:"New York",label:"City"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Fl,yl]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).twitter,"onUpdate:modelValue":a[15]||(a[15]=s=>l(t).twitter=s),placeholder:"https://twitter.com/abc",label:"Twitter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).facebook,"onUpdate:modelValue":a[16]||(a[16]=s=>l(t).facebook=s),placeholder:"https://facebook.com/abc",label:"Facebook"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).googlePlus,"onUpdate:modelValue":a[17]||(a[17]=s=>l(t).googlePlus=s),placeholder:"https://plus.google.com/abc",label:"Google+"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).linkedIn,"onUpdate:modelValue":a[18]||(a[18]=s=>l(t).linkedIn=s),placeholder:"https://linkedin.com/abc",label:"LinkedIn"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[r("div",Pl,[_l,r("p",Dl,u(l(t).username),1),r("p",Il,u(l(t).email),1),e(P,{class:"my-4"}),Ll,r("p",Tl,u(l(t).firstName),1),r("p",Wl,u(l(t).lastName),1),r("p",Nl,u(l(t).country),1),r("p",Bl,u(l(t).language),1),e(P,{class:"my-4"}),Ul,r("p",$l,u(l(t).address),1),r("p",zl,u(l(t).landmark),1),r("p",Rl,u(l(t).pincode),1),r("p",ql,u(l(t).city),1),e(P,{class:"my-4"}),jl,r("p",El,u(l(t).twitter),1),r("p",Gl,u(l(t).facebook),1),r("p",Ml,u(l(t).googlePlus),1),r("p",Hl,u(l(t).linkedIn),1)])]),_:1})]),_:1},8,["modelValue"]),r("div",Kl,[e(w,{color:"secondary",variant:"tonal",disabled:l(n)===0,onClick:a[20]||(a[20]=s=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1},8,["disabled"]),x.length-1===l(n)?(S(),_(w,{key:0,color:"success",onClick:I},{default:o(()=>[g(" submit ")]),_:1})):(S(),_(w,{key:1,onClick:a[21]||(a[21]=s=>n.value++)},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1}))])]),_:1})]),_:1})]),_:1})],64)}}}),Yl=r("h6",{class:"text-h6 font-weight-medium"}," Account Details ",-1),Ol=r("p",{class:"mb-0"}," Enter your Account Details ",-1),Ql={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},Xl=r("h6",{class:"text-h6 font-weight-medium"}," Personal Info ",-1),Zl=r("p",{class:"mb-0"}," Setup Information ",-1),eo={class:"d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"},lo=r("h6",{class:"text-h6 font-weight-medium"}," Address ",-1),oo=r("p",{class:"mb-0"}," Enter Your Address. ",-1),ao={class:"d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"},to=r("h6",{class:"text-h6 font-weight-medium"}," Social Links ",-1),so=r("p",{class:"mb-0"}," Add Social Links ",-1),ro={class:"d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"},io={class:"text-base"},no=r("h6",{class:"text-base font-weight-medium mb-2"}," Account ",-1),co={class:"mb-1"},mo={class:"mb-1"},po=r("h6",{class:"text-base font-weight-medium mb-2"}," Personal Info ",-1),uo={class:"mb-1"},Vo={class:"mb-1"},bo={class:"mb-1"},fo={class:"mb-1"},ho=r("h6",{class:"text-base font-weight-medium mb-2"}," Address ",-1),wo={class:"mb-1"},go={class:"mb-1"},vo={class:"mb-1"},Co={class:"mb-1"},xo=r("h6",{class:"text-base font-weight-medium mb-2"}," Social Links ",-1),So={class:"mb-1"},ko={class:"mb-1"},Ao={class:"mb-1"},Fo={class:"mb-1"},yo={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},Po=$({__name:"DemoFormWizardIconsValidation",setup(D){const x=[{title:"Account Details",icon:H},{title:"Personal Info",icon:J},{title:"Address",icon:K},{title:"Social Links",icon:Y},{title:"Review & Submit",icon:O}],n=b(0),V=b(!1),f=b(!1),t=b(!0),I=b(),B=b(),a=b(),L=b(),d=b({username:"",email:"",password:"",cPassword:""}),h=b({firstName:"",lastName:"",country:void 0,language:void 0}),s=b({twitter:"",facebook:"",googlePlus:"",linkedIn:""}),y=b({address:"",landmark:"",city:"",pincode:""}),Z=()=>{var c;(c=I.value)==null||c.validate().then(m=>{m.valid?(n.value++,t.value=!0):t.value=!1})},ee=()=>{var c;(c=B.value)==null||c.validate().then(m=>{m.valid?(n.value++,t.value=!0):t.value=!1})},le=()=>{var c;(c=L.value)==null||c.validate().then(m=>{m.valid?(n.value++,t.value=!0):t.value=!1})},oe=()=>{var c;(c=a.value)==null||c.validate().then(m=>{m.valid?(n.value++,t.value=!0):t.value=!1})};return(c,m)=>{const ae=q,F=R,Q=z;return S(),_(j,null,{default:o(()=>[e(N,null,{default:o(()=>[e(ae,{"current-step":l(n),"onUpdate:currentStep":m[0]||(m[0]=p=>T(n)?n.value=p:null),items:x,"is-active-step-valid":l(t),align:"center"},null,8,["current-step","is-active-step-valid"])]),_:1}),e(P),e(N,null,{default:o(()=>[e(E,{modelValue:l(n),"onUpdate:modelValue":m[24]||(m[24]=p=>T(n)?n.value=p:null),class:"disable-tab-transition"},{default:o(()=>[e(C,null,{default:o(()=>[e(l(W),{ref_key:"refAccountForm",ref:I,onSubmit:G(Z,["prevent"])},{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Yl,Ol]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(d).username,"onUpdate:modelValue":m[1]||(m[1]=p=>l(d).username=p),placeholder:"CarterLeonardo",rules:["requiredValidator"in c?c.requiredValidator:l(A)],label:"Username"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(d).email,"onUpdate:modelValue":m[2]||(m[2]=p=>l(d).email=p),placeholder:"carterleonardo@gmail.com",rules:["requiredValidator"in c?c.requiredValidator:l(A),"emailValidator"in c?c.emailValidator:l(ie)],label:"Email"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(d).password,"onUpdate:modelValue":m[3]||(m[3]=p=>l(d).password=p),placeholder:"············",label:"Password",rules:["requiredValidator"in c?c.requiredValidator:l(A),"passwordValidator"in c?c.passwordValidator:l(de)],type:l(V)?"text":"password","append-inner-icon":l(V)?"bx-hide":"bx-show","onClick:appendInner":m[4]||(m[4]=p=>V.value=!l(V))},null,8,["modelValue","rules","type","append-inner-icon"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(d).cPassword,"onUpdate:modelValue":m[5]||(m[5]=p=>l(d).cPassword=p),placeholder:"············",label:"Confirm Password",rules:["requiredValidator"in c?c.requiredValidator:l(A),("confirmedValidator"in c?c.confirmedValidator:l(ne))(l(d).cPassword,l(d).password)],type:l(f)?"text":"password","append-inner-icon":l(f)?"bx-hide":"bx-show","onClick:appendInner":m[6]||(m[6]=p=>f.value=!l(f))},null,8,["modelValue","rules","type","append-inner-icon"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[r("div",Ql,[e(w,{color:"secondary",variant:"tonal",disabled:""},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1}),e(w,{type:"submit"},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1})])]),_:1})]),_:1})]),_:1},512)]),_:1}),e(C,null,{default:o(()=>[e(l(W),{ref_key:"refPersonalForm",ref:B,onSubmit:G(ee,["prevent"])},{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Xl,Zl]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(h).firstName,"onUpdate:modelValue":m[7]||(m[7]=p=>l(h).firstName=p),label:"First Name",rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"Leonard"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(h).lastName,"onUpdate:modelValue":m[8]||(m[8]=p=>l(h).lastName=p),label:"Last Name",rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"Carter"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(Q,{modelValue:l(h).country,"onUpdate:modelValue":m[9]||(m[9]=p=>l(h).country=p),label:"Country",rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"Select Country",items:["UK","USA","Canada","Australia","Germany"]},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(Q,{modelValue:l(h).language,"onUpdate:modelValue":m[10]||(m[10]=p=>l(h).language=p),label:"Language",rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"Select Language",items:["English","Spanish","French","Russian","German"]},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[r("div",eo,[e(w,{color:"secondary",variant:"tonal",onClick:m[11]||(m[11]=p=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1}),e(w,{type:"submit"},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1})])]),_:1})]),_:1})]),_:1},512)]),_:1}),e(C,null,{default:o(()=>[e(l(W),{ref_key:"refAddressForm",ref:L,onSubmit:G(le,["prevent"])},{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[lo,oo]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(y).address,"onUpdate:modelValue":m[12]||(m[12]=p=>l(y).address=p),rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"98 Borough bridge Road, Birmingham",label:"Address"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(y).landmark,"onUpdate:modelValue":m[13]||(m[13]=p=>l(y).landmark=p),rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"Borough bridge",label:"Landmark"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(y).pincode,"onUpdate:modelValue":m[14]||(m[14]=p=>l(y).pincode=p),rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"658921",label:"Pincode",type:"number"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(y).city,"onUpdate:modelValue":m[15]||(m[15]=p=>l(y).city=p),rules:["requiredValidator"in c?c.requiredValidator:l(A)],placeholder:"New York",label:"City"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[r("div",ao,[e(w,{color:"secondary",variant:"tonal",onClick:m[16]||(m[16]=p=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1}),e(w,{type:"submit"},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1})])]),_:1})]),_:1})]),_:1},512)]),_:1}),e(C,null,{default:o(()=>[e(l(W),{ref_key:"refSocialLinkForm",ref:a,onSubmit:G(oe,["prevent"])},{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[to,so]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(s).twitter,"onUpdate:modelValue":m[17]||(m[17]=p=>l(s).twitter=p),placeholder:"https://twitter.com/abc",rules:["requiredValidator"in c?c.requiredValidator:l(A),"urlValidator"in c?c.urlValidator:l(M)],label:"Twitter"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(s).facebook,"onUpdate:modelValue":m[18]||(m[18]=p=>l(s).facebook=p),placeholder:"https://facebook.com/abc",rules:["requiredValidator"in c?c.requiredValidator:l(A),"urlValidator"in c?c.urlValidator:l(M)],label:"Facebook"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(s).googlePlus,"onUpdate:modelValue":m[19]||(m[19]=p=>l(s).googlePlus=p),placeholder:"https://plus.google.com/abc",rules:["requiredValidator"in c?c.requiredValidator:l(A),"urlValidator"in c?c.urlValidator:l(M)],label:"Google+"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(F,{modelValue:l(s).linkedIn,"onUpdate:modelValue":m[20]||(m[20]=p=>l(s).linkedIn=p),placeholder:"https://linkedin.com/abc",rules:["requiredValidator"in c?c.requiredValidator:l(A),"urlValidator"in c?c.urlValidator:l(M)],label:"LinkedIn"},null,8,["modelValue","rules"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[r("div",ro,[e(w,{color:"secondary",variant:"tonal",onClick:m[21]||(m[21]=p=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1}),e(w,{type:"submit"},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1})])]),_:1})]),_:1})]),_:1},512)]),_:1}),e(C,null,{default:o(()=>[r("div",io,[no,r("p",co,u(l(d).username),1),r("p",mo,u(l(d).email),1),e(P,{class:"my-4"}),po,r("p",uo,u(l(h).firstName),1),r("p",Vo,u(l(h).lastName),1),r("p",bo,u(l(h).country),1),r("p",fo,u(l(h).language),1),e(P,{class:"my-4"}),ho,r("p",wo,u(l(y).address),1),r("p",go,u(l(y).landmark),1),r("p",vo,u(l(y).pincode),1),r("p",Co,u(l(y).city),1),e(P,{class:"my-4"}),xo,r("p",So,u(l(s).twitter),1),r("p",ko,u(l(s).facebook),1),r("p",Ao,u(l(s).googlePlus),1),r("p",Fo,u(l(s).linkedIn),1)]),e(i,{cols:"12"},{default:o(()=>[r("div",yo,[e(w,{color:"secondary",variant:"tonal",disabled:l(n)===0,onClick:m[22]||(m[22]=p=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1},8,["disabled"]),e(w,{color:"success",onClick:m[23]||(m[23]=p=>console.log("Form Submitted"))},{default:o(()=>[g(" submit ")]),_:1})])]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})}}}),_o=r("h6",{class:"text-h6 font-weight-medium"}," Account Details ",-1),Do=r("p",{class:"mb-0"}," Enter your Account Details ",-1),Io=r("h6",{class:"text-h6 font-weight-medium"}," Personal Info ",-1),Lo=r("p",{class:"mb-0"}," Setup Information ",-1),To=r("h6",{class:"text-h6 font-weight-medium"}," Social Links ",-1),Wo=r("p",{class:"mb-0"}," Add Social Links ",-1),No={class:"d-flex flex-wrap gap-4 justify-space-between mt-8"},Bo=$({__name:"DemoFormWizardIconsVertical",setup(D){const x=[{title:"Account Details",icon:"bx-file",subtitle:"Setup account details"},{title:"Personal Info",icon:"bx-user",subtitle:"Add personal info"},{title:"Social Links",icon:"bx-link",subtitle:"Add social links"}],n=b(0),V=b(!1),f=b(!1),t=b({username:"",email:"",password:"",cPassword:"",firstName:"",lastName:"",country:void 0,language:void 0,twitter:"",facebook:"",googlePlus:"",linkedIn:""}),I=()=>{console.log(t.value)};return(B,a)=>{const L=q,d=R,h=z;return S(),_(j,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12",md:"4",class:se(B.$vuetify.display.smAndDown?"border-b":"border-e")},{default:o(()=>[e(N,null,{default:o(()=>[e(L,{"current-step":l(n),"onUpdate:currentStep":a[0]||(a[0]=s=>T(n)?n.value=s:null),direction:"vertical",items:x,"icon-size":"24",class:"stepper-icon-step-bg"},null,8,["current-step"])]),_:1})]),_:1},8,["class"]),e(i,{cols:"12",md:"8"},{default:o(()=>[e(N,null,{default:o(()=>[e(W,null,{default:o(()=>[e(E,{modelValue:l(n),"onUpdate:modelValue":a[15]||(a[15]=s=>T(n)?n.value=s:null),class:"disable-tab-transition"},{default:o(()=>[e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[_o,Do]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).username,"onUpdate:modelValue":a[1]||(a[1]=s=>l(t).username=s),placeholder:"CarterLeonardo",label:"Username"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).email,"onUpdate:modelValue":a[2]||(a[2]=s=>l(t).email=s),placeholder:"carterleonardo@gmail.com",label:"Email"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).password,"onUpdate:modelValue":a[3]||(a[3]=s=>l(t).password=s),label:"Password",placeholder:"············",type:l(V)?"text":"password","append-inner-icon":l(V)?"bx-hide":"bx-show","onClick:appendInner":a[4]||(a[4]=s=>V.value=!l(V))},null,8,["modelValue","type","append-inner-icon"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).cPassword,"onUpdate:modelValue":a[5]||(a[5]=s=>l(t).cPassword=s),label:"Confirm Password",placeholder:"············",type:l(f)?"text":"password","append-inner-icon":l(f)?"bx-hide":"bx-show","onClick:appendInner":a[6]||(a[6]=s=>f.value=!l(f))},null,8,["modelValue","type","append-inner-icon"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[Io,Lo]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).firstName,"onUpdate:modelValue":a[7]||(a[7]=s=>l(t).firstName=s),label:"First Name",placeholder:"Leonard"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).lastName,"onUpdate:modelValue":a[8]||(a[8]=s=>l(t).lastName=s),label:"Last Name",placeholder:"Carter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).country,"onUpdate:modelValue":a[9]||(a[9]=s=>l(t).country=s),label:"Country",placeholder:"Select Country",items:["UK","USA","Canada","Australia","Germany"]},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(h,{modelValue:l(t).language,"onUpdate:modelValue":a[10]||(a[10]=s=>l(t).language=s),label:"Language",placeholder:"Select Language",items:["English","Spanish","French","Russian","German"]},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(C,null,{default:o(()=>[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[To,Wo]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).twitter,"onUpdate:modelValue":a[11]||(a[11]=s=>l(t).twitter=s),placeholder:"https://twitter.com/abc",label:"Twitter"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).facebook,"onUpdate:modelValue":a[12]||(a[12]=s=>l(t).facebook=s),placeholder:"https://facebook.com/abc",label:"Facebook"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).googlePlus,"onUpdate:modelValue":a[13]||(a[13]=s=>l(t).googlePlus=s),placeholder:"https://plus.google.com/abc",label:"Google+"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"6"},{default:o(()=>[e(d,{modelValue:l(t).linkedIn,"onUpdate:modelValue":a[14]||(a[14]=s=>l(t).linkedIn=s),placeholder:"https://linkedin.com/abc",label:"LinkedIn"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"]),r("div",No,[e(w,{color:"secondary",variant:"tonal",disabled:l(n)===0,onClick:a[16]||(a[16]=s=>n.value--)},{default:o(()=>[e(k,{icon:"bx-left-arrow-alt",start:"",class:"flip-in-rtl"}),g(" Previous ")]),_:1},8,["disabled"]),x.length-1===l(n)?(S(),_(w,{key:0,color:"success",onClick:I},{default:o(()=>[g(" submit ")]),_:1})):(S(),_(w,{key:1,onClick:a[17]||(a[17]=s=>n.value++)},{default:o(()=>[g(" Next "),e(k,{icon:"bx-right-arrow-alt",end:"",class:"flip-in-rtl"})]),_:1}))])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}}}),Uo=r("h3",{class:"text-h3 my-4"}," Modern ",-1),xa=$({__name:"form-wizard-icons",setup(D){return(x,n)=>{const V=re,f=we;return S(),U(X,null,[e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[e(V,{variant:"outlined",title:"Basic",code:ge},{default:o(()=>[e(wl)]),_:1},8,["code"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[e(V,{variant:"outlined",title:"Validation",code:xe},{default:o(()=>[e(Po)]),_:1},8,["code"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[e(V,{variant:"outlined",title:"Vertical",code:Se},{default:o(()=>[e(Bo)]),_:1},8,["code"])]),_:1})]),_:1}),e(P,{class:"my-10 mx-n6"}),Uo,e(v,null,{default:o(()=>[e(i,{cols:"12"},{default:o(()=>[e(V,{variant:"outlined",title:"Modern basic",code:ve},{default:o(()=>[e(Jl)]),_:1},8,["code"])]),_:1}),e(i,{cols:"12"},{default:o(()=>[e(V,{variant:"outlined",title:"Modern Vertical",code:Ce},{default:o(()=>[e(f)]),_:1},8,["code"])]),_:1})]),_:1})],64)}}});export{xa as default};
