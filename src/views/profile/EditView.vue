<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import FailComponent from '@/components/alerts/FailComponent.vue';
import child from '@/assets/images/child.png';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import api from '@/utils/api';
import { triggerToast } from '@/utils/toast';
import { authStore } from '@/stores/AuthStore';

const router = useRouter();
const route = useRoute()
const id = authStore.user.userId
const errors = ref([]);
const isLoading = ref(false)

// input form
const username = ref('');
const email = ref('');
const password = ref('');
const fullName = ref('');
const phone = ref('');
const address = ref('');
const deafness = ref('');
const dateOfBirth = ref('');
const parentName = ref('');
const parentPhone = ref('');
const parentAddress = ref('');
const parentWork = ref('');

// alerts
const showAlert = ref(false);
const alertTitle = ref('');
const alertMsg = ref('');

function toggleAlert() {
    showAlert.value = !showAlert.value;
}

onMounted(async () => {
    await api.get(`/childs/${id}`)
        .then((res) => {
            const data = res.data.data.child

            username.value = data.username ?? null
            fullName.value = data.fullName ?? null
            email.value = data.email ?? null
            phone.value = data.phone ?? null
            address.value = data.address ?? null
            dateOfBirth.value = new Date(data.dateOfBirth ?? null).toISOString().split('T')[0];
            deafness.value = data.deafness ?? null
            parentName.value = data?.parent?.fullName ?? null
            parentPhone.value = data?.parent?.phone ?? null
            parentAddress.value = data?.parent?.address ?? null
            parentWork.value = data?.parent?.work ?? null
        }).catch((e) => {
            console.log(e)
            triggerToast('Gagal memuat data', 'error')
        })
})

async function submit() {
    errors.value = null;

    await api.put(`/childs/${id}`, {
        username: username.value,
        password: password.value,
        email: email.value,
        fullName: fullName.value,
        phone: phone.value,
        address: address.value,
        deafness: deafness.value,
        dateOfBirth: dateOfBirth.value,
        parentName: parentName.value,
        parentPhone: parentPhone.value,
        parentAddress: parentAddress.value,
        parentWork: parentWork.value,
    })
        .then((res) => {

        })
        .catch((e) => {
            if (e.status === 422) errors.value = e.response.data.errors;
            if (e.status === 400) {
                showAlert.value = true;
                alertTitle.value = 'Gagal menambahkan anak didik';
                alertMsg.value = e.response.data.message;
            }
        })
        .finally(() => {
            isLoading.value = false
        })
}
</script>

<template>
    <FailComponent v-show="showAlert" @close="toggleAlert" :title="alertTitle" :message="alertMsg" />

    <div class="container">
        <div class="page-header">
            <h1 class="page-title">Edit Profile</h1>
        </div>

        <div class="page-body">
            <div class="card">
                <div class="card-body">

                    <!-- IMAGE -->
                    <img :src="child" alt="Child" class="child-img">

                    <!-- FORM -->
                    <div class="form-wrapper" v-if="authStore.user.role == 1">
                        <input-component label="Username" type="text" placeholder="Contoh: bryandayon" class="input"
                            v-model="username" :isInvalid="errors?.username ?? false"
                            :invalidMsg="errors?.username ?? ''" />

                        <input-component label="Email" type="email" placeholder="Contoh: contoh@mail.com" class="input"
                            v-model="email" :isInvalid="errors?.email ?? false" :invalidMsg="errors?.email ?? ''" />

                        <input-component label="Password" type="text"
                            placeholder="Masukkan password baru jika ingin mengganti password" class="input"
                            v-model="password" :isInvalid="errors?.password ?? false"
                            :invalidMsg="errors?.password ?? ''" />

                        <input-component label="Nama" type="text" placeholder="Contoh: Bryan Dayon" class="input"
                            v-model="fullName" :isInvalid="errors?.fullName ?? false"
                            :invalidMsg="errors?.fullName ?? ''" />

                        <input-component label="Nomor Telepon " type="text" placeholder="Contoh: 628*********"
                            class="input" v-model="phone" :isInvalid="errors?.phone ?? false"
                            :invalidMsg="errors?.phone ?? ''" />


                        <input-component label="Alamat" type="text" placeholder="Alamat" class="input" v-model="address"
                            :isInvalid="errors?.address ?? false" :invalidMsg="errors?.address ?? ''" />


                        <div class="btn-submit">
                            <button-component :isDisabled="isLoading" :label="isLoading ? 'Loading...' : 'Simpan'"
                                size="full" @click="submit" />
                        </div>

                    </div>
                    <div class="form-wrapper" v-else>
                        <input-component label="Username" type="text" placeholder="Contoh: bryandayon" class="input"
                            v-model="username" :isInvalid="errors?.username ?? false"
                            :invalidMsg="errors?.username ?? ''" />

                        <input-component label="Email" type="email" placeholder="Contoh: bryandayon@gmail.com"
                            class="input" v-model="email" :isInvalid="errors?.email ?? false"
                            :invalidMsg="errors?.email ?? ''" />

                        <input-component label="Password" type="text"
                            placeholder="Masukkan password baru jika ingin mengganti password" class="input"
                            v-model="password" :isInvalid="errors?.password ?? false"
                            :invalidMsg="errors?.password ?? ''" />

                        <input-component label="Nama Anak" type="text" placeholder="Contoh: Bryan Dayon" class="input"
                            v-model="fullName" :isInvalid="errors?.fullName ?? false"
                            :invalidMsg="errors?.fullName ?? ''" />

                        <input-component label="Jenis Ketunaan" type="text" placeholder="Contoh: Tunagrahita"
                            class="input" v-model="deafness" :isInvalid="errors?.deafness ?? false"
                            :invalidMsg="errors?.deafness ?? ''" />

                        <input-component label="Tanggal Lahir" type="date" class="input" v-model="dateOfBirth"
                            :isInvalid="errors?.dateOfBirth ?? false" :invalidMsg="errors?.dateOfBirth ?? ''" />

                        <input-component label="Nama Wali" type="text" placeholder="Contoh: Susi" class="input"
                            v-model="parentName" :isInvalid="errors?.parentName ?? false"
                            :invalidMsg="errors?.parentName ?? ''" />

                        <input-component label="Nomor Telepon Wali" type="text" placeholder="Contoh: 628*********"
                            class="input" v-model="parentPhone" :isInvalid="errors?.parentPhone ?? false"
                            :invalidMsg="errors?.parentPhone ?? ''" />

                        <input-component label="Alamat Wali" type="text" placeholder="Alamat" class="input"
                            v-model="parentAddress" :isInvalid="errors?.parentAddress ?? false"
                            :invalidMsg="errors?.parentAddress ?? ''" />

                        <input-component label="Pekerjaan Wali" type="text" placeholder="Pekerjaan" class="input"
                            v-model="parentWork" :isInvalid="errors?.parentWork ?? false"
                            :invalidMsg="errors?.parentWork ?? ''" />

                        <div class="btn-submit">
                            <button-component :isDisabled="isLoading" :label="isLoading ? 'Loading...' : 'Simpan'"
                                size="full" @click="submit" />
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card {
    background-color: var(--White);
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 5.192px 31.153px rgba(0, 0, 0, 0.25);

    .card-body {
        display: grid;
        grid-template-columns: 28% 72%;
        gap: 40px;
        align-items: center;

        .child-img {
            width: 85%;
            max-width: 260px;
            justify-self: center;
        }

        .form-wrapper {
            width: 85%;
            display: flex;
            flex-direction: column;
            gap: 22px;
        }

        .btn-submit {
            width: 100%;
            margin-top: 10px;
        }
    }
}

/* Responsive */
@media (max-width: 992px) {
    .card {
        padding: 2rem;

        .card-body {
            grid-template-columns: 1fr;
            gap: 30px;

            .child-img {
                max-width: 200px;
            }

            .form-wrapper {
                width: 100%;
            }

            .btn-wrapper {
                width: 100%;
            }
        }
    }
}

@media (max-width: 576px) {
    .card {
        padding: 1.5rem;
        border-radius: 15px;
    }
}
</style>
