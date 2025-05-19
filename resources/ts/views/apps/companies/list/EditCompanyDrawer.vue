<script setup lang="ts">
import { defineEmits, defineProps, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  isDrawerOpen: boolean;
  companyId: number | null;
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void;
  (e: 'companyUpdated', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const { t } = useI18n();

const companyName = ref('');
const refForm = ref(null);

// Add validator
const requiredValidator = (value: string | null) => !!value || 'This field is required.';

// Fetch company details
const fetchCompanyDetails = async () => {
  if (!props.companyId) return;

  try {
    const response = await fetch(`/api/companies/${props.companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch company details.');

    const company = await response.json();
    companyName.value = company.companyName || '';
  } catch (error) {
    console.error('Error fetching company details:', error);
  }
};

// Close drawer
const closeDrawer = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => refForm.value?.resetValidation());
};

// Update company
const updateCompany = async () => {
  if (!props.companyId) return;

  try {
    const response = await fetch(`/api/companies/${props.companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ company_name: companyName.value }),
    });

    if (!response.ok) throw new Error('Failed to update company.');

    const updatedCompany = await response.json();
    emit('companyUpdated', { success: 'Company updated successfully!', company: updatedCompany });
    closeDrawer();
  } catch (error) {
    console.error('Error updating company:', error);
    emit('companyUpdated', { error: 'Failed to update company. Please try again.' });
  }
};

// Watch companyId changes
watch(() => props.companyId, fetchCompanyDetails);

onMounted(fetchCompanyDetails);
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    border="none"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="closeDrawer"
  >
    <AppDrawerHeaderSection
      :title="t('companies.edit')"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCardText>
      <VForm ref="refForm" @submit.prevent="updateCompany">
        <VTextField
          v-model="companyName"
          label="Company Name"
          :rules="[requiredValidator]"
        />
        <VRow>
          <VCol>
            <VBtn type="submit">Save</VBtn>
            <VBtn type="reset" variant="tonal" color="error" @click="closeDrawer">Cancel</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VNavigationDrawer>
</template>
