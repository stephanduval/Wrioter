<template>
  <!-- 👉 varaints  -->
  <VRow>
    <VCol cols="12">
      <VCard title="Variants">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                eager
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete density -->
    <VCol cols="12">
      <VCard title="density">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete placeholder  -->
    <VCol cols="12">
      <VCard title="placeholder">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                placeholder="Enter city"
                variant="outlined"
                class="my-5"
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                placeholder="Enter city"
                variant="outlined"
                class="my-5"
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                placeholder="Enter city"
                class="my-5"
                variant="outlined"
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete Multiple -->
    <VCol cols="12">
      <VCard title="Multiple">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                multiple
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete with clearable -->
    <VCol cols="12">
      <VCard title="clearable">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                clearable
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                clearable
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                clearable
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete with closable chips -->
    <VCol cols="12">
      <VCard title="with closable chips">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                closable-chips
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                closable-chips
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                multiple
                closable-chips
                chips
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Autocomplete closable chips with clearable -->
    <VCol cols="12">
      <VCard title="closable chip with  clearble">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                clearable
                closable-chips
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                clearable
                closable-chips
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                multiple
                clearable
                closable-chips
                chips
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete with chips -->
    <VCol cols="12">
      <VCard title="with chips">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                class="my-5"
                multiple
                chips
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="outlined"
                multiple
                chips
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete prepend inner icons -->
    <VCol cols="12">
      <VCard title="prepend inner icons">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                class="my-5"
                density="default"
                prepend-inner-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="solo"
                density="comfortable"
                prepend-inner-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                multiple
                class="my-5"
                density="compact"
                prepend-inner-icon="bx-bxs-factory"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="plain"
                prepend-inner-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                prepend-inner-icon="bx-bxs-factory"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                prepend-inner-icon="bx-bxs-factory"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                class="my-5"
                prepend-inner-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                prepend-inner-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                prepend-inner-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                prepend-inner-icon="bx-building"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                prepend-inner-icon="bx-building"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                prepend-inner-icon="bx-building"
                variant="outlined"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                prepend-inner-icon="bx-bxs-factory"
                variant="underlined"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="underlined"
                prepend-inner-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                prepend-inner-icon="bx-bxs-factory"
                variant="underlined"
                density="compact"
                multiple
                class="my-5"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete prepend icons -->
    <VCol cols="12">
      <VCard title="prepend icons">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                class="my-5"
                density="default"
                prepend-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="solo"
                density="comfortable"
                prepend-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                multiple
                class="my-5"
                density="compact"
                prepend-icon="bx-bxs-factory"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="plain"
                prepend-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                prepend-icon="bx-bxs-factory"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                prepend-icon="bx-bxs-factory"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                class="my-5"
                prepend-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                prepend-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                prepend-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                prepend-icon="bx-building"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                prepend-icon="bx-building"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                prepend-icon="bx-building"
                variant="outlined"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                prepend-icon="bx-bxs-factory"
                variant="underlined"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="underlined"
                prepend-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                prepend-icon="bx-bxs-factory"
                variant="underlined"
                density="compact"
                multiple
                class="my-5"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete append icons -->
    <VCol cols="12">
      <VCard title="append icons">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                class="my-5"
                density="default"
                append-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="solo"
                density="comfortable"
                append-icon="bx-bxs-factory"
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                multiple
                class="my-5"
                density="compact"
                append-icon="bx-bxs-factory"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="plain"
                append-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                append-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                append-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                append-icon="bx-building"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                append-icon="bx-building"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                append-icon="bx-building"
                variant="outlined"
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                append-icon="bx-bxs-factory"
                variant="underlined"
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="underlined"
                append-icon="bx-bxs-factory"
                class="my-5"
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                append-icon="bx-bxs-factory"
                variant="underlined"
                density="compact"
                multiple
                class="my-5"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 autocomplete loading  -->
    <VCol cols="12">
      <VCard title="loading">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                class="my-5"
                density="default"
                append-icon="bx-bxs-factory"
                loading
                multiple
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="solo"
                density="comfortable"
                append-icon="bx-bxs-factory"
                multiple
                loading
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="solo"
                multiple
                class="my-5"
                density="compact"
                loading
                append-icon="bx-bxs-factory"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                variant="plain"
                append-icon="bx-bxs-factory"
                multiple
                density="default"
                loading
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                loading
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="plain"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                loading
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                class="my-5"
                append-icon="bx-bxs-factory"
                multiple
                loading
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                append-icon="bx-bxs-factory"
                class="my-5"
                multiple
                loading
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="filled"
                append-icon="bx-bxs-factory"
                class="my-5"
                multiple
                loading
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                append-icon="bx-building"
                class="my-5"
                loading
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="outlined"
                append-icon="bx-building"
                class="my-5"
                loading
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                class="my-5"
                append-icon="bx-building"
                variant="outlined"
                loading
                multiple
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                append-icon="bx-bxs-factory"
                variant="underlined"
                loading
                class="my-5"
                multiple
                density="default"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                variant="underlined"
                append-icon="bx-bxs-factory"
                class="my-5"
                loading
                multiple
                density="comfortable"
              />
              <AppAutocomplete
                label="City"
                :items="['Delhi', 'Mumbai', 'Ahemedabad', 'Bangalore', 'Jaipur']"
                append-icon="bx-bxs-factory"
                variant="underlined"
                density="compact"
                loading
                multiple
                class="my-5"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
