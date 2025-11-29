<script setup lang="ts">
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import DoneIcon from '@/components/shape/DoneIcon.vue';
import LockIcon from '@/components/shape/LockIcon.vue';
import LockOpenIcon from '@/components/shape/LockOpenIcon.vue';
import { formatDate } from '@/helpers/formatDate';
import { authStore } from '@/stores/AuthStore';
import { workStore } from '@/stores/WorkStore';
import api from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const isWorkMode = workStore.isWorkMode

const data = ref([])
const id = route.params.id

const totalQuizPoint = ref(0)


onMounted(async () => {
    let params
    if (isWorkMode) {
        params = {
            hidden: false
        }
    }

    await api.get(`/exercise/${route.params.id}`, {
        params: params
    })
        .then((res) => {
            console.log(res);
            data.value = res.data.data
            console.log(data.value);

            calculateTotalPoint()

        }).catch(err => {
            console.error(err)
        })
})

const calculateTotalPoint = () => {
    data.value.quiz.forEach(item => {
        totalQuizPoint.value += parseInt(item.quizPoint) || 0
    });
}

</script>

<template>
    <div class="container">
        <div class="page-header">
            <router-link :to="{ name: 'childs.detail', params: { id: data?.childrenId } }">
                <ChevronLeftIcon />
            </router-link>
            <div>
                <p class="page-title">Kerjakan : <strong>{{ data?.name }}</strong></p>
                <div class="page-description" v-html="data?.description"></div>
            </div>
        </div>
        <div class="page-body">
            <div class="action">
                <p class="score">Total Skor : <strong>{{ totalQuizPoint }}</strong></p>
                <ButtonComponent label="Buat Latihan" class="secondary"
                    @click="router.push({ name: 'exercise.quiz.create', params: { id: id } })" v-if="!isWorkMode && authStore?.user?.role == 1" />
            </div>
            <div class="quiz-container">
                <div :class="['item', { disabled: index > 0 ? data?.quiz[index - 1]?.answers?.length == 0 || data?.quiz[index - 1]?.quizPoint < 60 : false }]"
                    v-for="(item, index) in data?.quiz" :key="index"
                    @click="(index > 0 ? data?.quiz[index - 1]?.answers?.length == 0 || data?.quiz[index - 1]?.quizPoint < 60 : false) ? null : $router.push({ name: 'exercise.quiz.overview', params: { id: id, quizId: item._id } })">
                    <div class="point">{{ item?.quizPoint ?? 0 }}</div>
                    <div class="identity">
                        <p class="title">{{ item.name }}</p>
                        <p class="date">{{ formatDate(item.date) }}</p>
                        <div class="category">Level {{ item.level }}</div>
                    </div>
                    <div class="status">
                        <DoneIcon v-if="item.answers.length > 0" />
                        <LockOpenIcon
                            v-else-if="index > 0 ? data?.quiz[index - 1]?.answers?.length > 0 && data?.quiz[index - 1]?.quizPoint > 60 : true" />
                        <LockIcon v-else />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style lang="scss" scoped>
.action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap; // <-- Tambahan: agar rapi jika menyempit
    gap: 15px; // <-- Tambahan: beri jarak jika wrap

    p {
        font-size: 35px;
        color: var(--Secondary-900);
    }
}

.quiz-container {
    .item {
        display: grid;
        // Gunakan unit fr dan atur lebar kolom
        grid-template-columns: 100px 1fr 100px; // <-- Diubah dari %
        gap: 40px;
        align-items: center;
        border: 3px solid var(--Secondary-900);
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 30px;
        cursor: pointer;
        background: var(--White);
        transition: background-color 0.2s; // <-- Tambahkan transisi

        &:hover {
            background-color: var(--Neutral-100); // <-- Efek hover
        }

        .point {
            font-size: 50px;
            color: var(--Secondary-900);
            text-align: center;
            border-right: 3px dashed var(--Info-200);
            padding: 10px;
        }

        .identity {
            font-size: 25px;
            color: var(--Secondary-900);

            .title {
                font-weight: bold;
            }

            .category {
                padding: 5px 15px;
                border-radius: 10px;
                margin-top: 10px;
                font-size: 15px;
                background-color: var(--Secondary-900);
                width: fit-content;
                color: white;
            }
        }

        .status {
            // <-- Tambahan style untuk perataan status
            justify-self: center; // Pusatkan ikon
        }

        .question {
            // Style ini tidak ada di HTML Anda
            text-align: center;
            font-size: 30px;
            color: var(--Info-200);

            .worked {
                color: var(--Secondary-900);
            }

            .total {
                color: var(--Primary-900);
            }
        }

        &.disabled {
            cursor: not-allowed;
            opacity: 50%;
            background-color: var(--Neutral-100); // Abu-abu saat disabled

            &:hover {
                background-color: var(--Neutral-100); // Tidak ada efek hover
            }
        }
    }
}

/* --- RESPONSIVE --- */

/* Target Tablet */
@media (max-width: 768px) {
    .action {
        flex-direction: column; // <-- Pecah jadi vertikal
        align-items: flex-start; // <-- Ratakan kiri

        p {
            font-size: 28px; // Kecilkan font
        }

        button {
            width: 100%; // Penuhi layar
        }
    }

    .quiz-container .item {
        // Ubah layout grid untuk mobile
        grid-template-columns: 70px 1fr; // <-- 2 kolom (point, identity)
        grid-template-rows: auto 1fr; // <-- 2 baris
        gap: 15px;
        padding: 15px;

        .point {
            grid-row: 1 / 3; // <-- Ambil 2 baris
            font-size: 40px;
            padding: 0;
            border-right: 2px dashed var(--Info-200);
        }

        .identity {
            grid-column: 2 / 3; // <-- Kolom 2
            grid-row: 1 / 2; // <-- Baris 1
            font-size: 18px;
        }

        .status {
            grid-column: 2 / 3; // <-- Kolom 2
            grid-row: 2 / 3; // <-- Baris 2
            justify-self: flex-start; // Ratakan kiri
            padding-top: 10px;
        }
    }
}
</style>

<!-- INIII HALAMAN UPDATE DARI QUIZ AWAL -->

<!-- <script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import HistoryComponent from '@/components/cards/HistoryComponents.vue';
import EyeIcon from '@/components/shape/EyeIcon.vue';
import EyeSlashIcon from '@/components/shape/EyeSlashIcon.vue';

import { formatDate } from '@/helpers/formatDate';
import { authStore } from '@/stores/AuthStore';
import { workStore } from '@/stores/WorkStore';

import api from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const data = ref(null);
const isWorkMode = ref(false);

const visibility = () => {
    data.value.isHidden = !data.value.isHidden;
};

const dummyHistory = [
    {
        point: 60,
        answeredCount: 15,
        totalQuestions: 20,
        createdAt: '2025-07-28'
    },
    {
        point: 60,
        answeredCount: 15,
        totalQuestions: 20,
        createdAt: '2025-07-28'
    }
];
</script> -->

<!-- <template>
    <div class="container"> 

        <div class="page-header">
            <router-link :to="{ name: 'exercise.quiz.list', params: { id } }">
                <ChevronLeftIcon />
            </router-link>

            <h1 class="page-title">Mengerjakan Latihan</h1>
        </div>

        <div class="page-body">
            <div class="card overview-card"> 

                <div class="card-header">
                    <h3>{{ data?.name ?? 'Latihan Membaca' }}</h3>

                    <div class="header-actions">
                        <ButtonComponent
                            v-if="!isWorkMode && authStore.user.role == 1"
                            :label="!data?.isHidden ? 'Sembunyikan' : 'Tampilkan'"
                            :icon="!data?.isHidden ? EyeSlashIcon : EyeIcon"
                            class="secondary"
                            size="small"
                            display="border"
                            @click="visibility"
                        />

                        <ButtonComponent
                            label="Edit"
                            class="secondary"
                            size="small"
                            display="border"
                            @click="handleEditClick"
                        />
                    </div>
                </div> -->

                <!-- CARD BODY -->
                <!-- <div class="card-body"> 

                    <div class="description">
                        <span class="value">
                            {{ data?.description ?? 'Lorem ipsum dolor sit amet' }}
                        </span>
                    </div>

                    <div class="data">

                        <div class="row">
                            <span class="label">Tanggal Dibuat :</span>
                            <span class="value">{{ data?.date ?? '10/12/2025' }}</span>
                        </div>

                        <div class="row">
                            <span class="label">Jumlah Soal :</span>
                            <span class="value">{{ data?.questions?.length ?? 0 }} Soal</span>
                        </div>

                        <div class="row">
                            <span class="label">Poin Lolos :</span>
                            <span class="value">{{ data?.point ?? 100 }} Poin</span>
                        </div> 

                        <div class="row type-row">
                            <span class="label">Tipe Latihan :</span>
                            <span class="value type-badge-inline">
                                {{ data?.method ?? 'Membaca' }}
                            </span>
                        </div> 

                        <div class="action">
                            <ButtonComponent
                                v-if="authStore?.user?.role == 1"
                                label="Kerjakan Latihan"
                                class="secondary"
                                size=""
                            />
                        </div>
                    </div>

                    <HistoryComponent
                        :items="data?.answers && data.answers.length > 0 ? data.answers : dummyHistory"
                    />
                </div>
            </div>
        </div>
    </div>
</template> -->

<!-- <style lang="scss" scoped>
.page-header h1 {
    color: var(--Secondary-900) !important;
}

.page-header svg path {
    fill: var(--Secondary-900) !important;

    
}

.page-body {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.card.overview-card {
    width: 95%;
    max-width: 980px;
    padding: 32px;
    border-radius: 18px;
    background: var(--White);
    box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
    

    /* header */
    .card-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;  // biar spacing rapi
    margin-bottom: 18px;

    h3 {
        font-size: 22px;
        font-weight: 700;
        color: var(--Secondary-900);
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }

    /* Garis blue nya */
    &::after {
        content: "";
        grid-column: 1 / -1;  // FULL WIDTH
        display: block;
        width: 100%;
        height: 2px;
        background: var(--Secondary-900);
        margin-top: 10px;
        border-radius: 10px;
    }
}


    /* body */
    .card-body {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 24px;

        .description {
            font-size: 13px;
            color: var(--Neutral-700);
        }

        /* data */
        .data {
            .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;

                .label,
                .value {
                    color: var(--Secondary-900);
                }
            }

            .type-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .type-badge-inline {
                background: var(--Info-50, #e9f5ff);
                padding: 4px 10px;
                border-radius: 10px;
                font-size: 13px;
            }

            .action {
                margin-top: 18px;
                display: flex;
                justify-content: flex-end;
            }
        }
    }

    /* view tablet */
    @media (max-width: 1024px) {
        .card-body {
            grid-template-columns: 1fr 260px;
        }
    }

    /* view mobile*/
    @media (max-width: 768px) {
    
        .card.overview-card {
            padding: 20px;
        }

        .card-header {
            grid-template-columns: 1fr;   // header jadi 1 kolom
            gap: 12px;

            .header-actions {
                width: 100%;
                flex-direction: column;

                button {
                    width: 100%;
                }
            }
        }

        /* jadi 1 column */
        .card-body {
            grid-template-columns: 1fr;
        }

        /* button setting */
        .data .action {
            justify-content: stretch;

            button {
                width: 100%;
            }
        }
    }
}
</style>
 -->
