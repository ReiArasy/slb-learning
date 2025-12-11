<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import FailComponent from '@/components/alerts/FailComponent.vue';
import child from '@/assets/images/child.png';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/utils/api';

const router = useRouter();

// input form
const name = ref('');
const disability = ref('');
const birthDate = ref('');
const guardian = ref('');

// alerts
const showAlert = ref(false);
const alertTitle = ref('');
const alertMsg = ref('');

function toggleAlert() {
	showAlert.value = !showAlert.value;
}

const errors = ref([]);
async function submit() {
	errors.value = null;

	await api.post(`/childs/insert`, {
		name: name.value,
		disability: disability.value,
		birth_date: birthDate.value,
		guardian: guardian.value
	})
		.then(() => {
			router.push({ name: 'childs.index' });
		})
		.catch((e) => {
			if (e.status === 422) errors.value = e.response.data.errors;
			if (e.status === 400) {
				showAlert.value = true;
				alertTitle.value = 'Gagal menambahkan anak didik';
				alertMsg.value = e.response.data.message;
			}
		});
}
</script>

<template>
	<FailComponent v-show="showAlert" @close="toggleAlert" :title="alertTitle" :message="alertMsg" />

	<div class="container">
		<div class="page-header">
			<h1 class="page-title">Tambah Data Anak</h1>
			<button-component label="Kembali" size="small" display="border"
				@click="router.push({ name: 'childs.index' })" />
		</div>

		<div class="page-body">
			<div class="card">
				<div class="card-body">

					<!-- IMAGE -->
					<img :src="child" alt="Child" class="child-img">

					<!-- FORM -->
					<div class="form-wrapper">
						<input-component label="Nama Anak" type="text" placeholder="Contoh: Bryan Dayon" class="input"
							v-model="name" :isInvalid="errors?.name ?? false" :invalidMsg="errors?.name ?? ''" />

						<input-component label="Jenis Ketunaan" type="text" placeholder="Contoh: Tunagrahita"
							class="input" v-model="disability" :isInvalid="errors?.disability ?? false"
							:invalidMsg="errors?.disability ?? ''" />

						<input-component label="Tanggal Lahir" type="date" class="input" v-model="birthDate"
							:isInvalid="errors?.birth_date ?? false" :invalidMsg="errors?.birth_date ?? ''" />

						<input-component label="Nama Wali" type="text" placeholder="Contoh: Susi" class="input"
							v-model="guardian" :isInvalid="errors?.guardian ?? false"
							:invalidMsg="errors?.guardian ?? ''" />

						<div class="btn-submit">
							<button-component label="Simpan" size="full" @click="submit" />
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
