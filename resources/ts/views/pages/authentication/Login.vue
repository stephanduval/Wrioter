<script>
import axios from 'axios'

const onSubmit = async () => {
  try {
    console.log('Attempting login with:', credentials)

    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value,
    })

    console.log('Server response:', response.data) // Debug the response

    const authData = response.data

    // Validate the response data
    if (!authData || typeof authData !== 'object')
      throw new Error('Invalid response format')

    // Create user data with default values
    const userDataObj = {
      id: authData.id || '',
      fullName: authData.fullName || '',
      username: authData.username || '',
      email: authData.email || '',
      role: 'user', // Default role
      abilityRules: [],
    }

    // Update with actual values if they exist
    if (authData.role)
      userDataObj.role = authData.role.toLowerCase()

    if (Array.isArray(authData.abilityRules))
      userDataObj.abilityRules = authData.abilityRules

    // Store the validated user data
    userData.value = userDataObj

    // Update ability rules
    ability.update(authData.abilityRules)

    // Determine redirect based on role
    const redirectTo = authData.role.toLowerCase() === 'admin'
      ? { name: 'dashboard-crm' }
      : { name: 'access-control' }

    console.log('Redirecting to:', redirectTo)
    router.push(redirectTo)
  }
  catch (error) {
    console.error('Login error:', error)
    toast.error('Login failed. Please check your credentials.')
  }
}
</script>

<template>
  <div>
    <!-- Your login form components go here -->
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
