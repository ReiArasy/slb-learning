<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import ConfirmComponent from '@/components/confirm/ConfirmComponent.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import WysiwygEditorComponent from '@/components/fields/WysiwygEditorComponent.vue';
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import api from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute()
const router = useRouter()

const id = route.params.id
const quizId = route.params.quizId
const isConfirmOpen = ref(false); // Konfirmasi Submit

const data = ref({})
const note = ref(null)
const point = ref(null)

onMounted(async () => {
    try {
        const exerciseResponse = await api.get(`/exercise/${id}`);
        const exerciseData = exerciseResponse.data.data;
        data.value.exercise = exerciseData;

        if (exerciseData && exerciseData.childrenId) {
            const childResponse = await api.get(`/childs/${exerciseData.childrenId}`);
            data.value.child = childResponse.data.data.child;
        } else {
            console.warn("Data latihan atau childrenId tidak ditemukan.");
        }
    } catch (err) {
        console.error("Gagal mengambil data:", err);
    }
});

const submit = async () => {
    await api.post('/exercise/attitude', {
        exerciseId: id,
        quizId: quizId,
        note: note.value,
        point: point.value
    }).then(res => {
        console.log(res);
        router.push({ name: 'exercise.quiz.summary', params: { id: id, quizId: quizId } })
    }).catch(err => {
        console.log(err);
    })
}

// START Confirmation Modal Handlers
const showConfirmation = () => {
    isConfirmOpen.value = true;
};

const handleConfirmAction = () => {
    submit(); // Panggil fungsi submit utama
    isConfirmOpen.value = false; // Tutup modal
};

const handleCancelAction = () => {
    isConfirmOpen.value = false; // Tutup modal
};
// END Confirmation Modal Handlers
</script>

<template>
    <div class="attitude-detail-container">

        <!-- back and title -->
        <div class="header-row">
            <router-link :to="{ name: 'exercise.quiz.summary', params: { id, quizId } }" class="back-icon">
                <ChevronLeftIcon />
            </router-link>
            <h1 class="title">Detail Perilaku Anak</h1>
        </div>

        <!-- child info -->
        <div class="child-info">
            <div class="child-left">
                <h2 class="child-name">{{ data?.child?.fullName }}</h2>
                <p class="child-score">
                    Nilai Perilaku: <span>{{ data?.attitude?.point? '' : '80' }}</span>
                </p>
                <p class="child-date">
                    Catatan Perilaku - {{ data?.date ?? '10/12/2025' }}
                </p>
            </div>

            <p class="child-code">#{{ data?.child?.code }}</p>
        </div>

        <!-- note -->
        <div class="note-section">
            <label>Catatan Perilaku</label>

            <!-- hasil hasil note -->
            <div class="note-content" v-html="data?.attitude?.note? '' : 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Ex sapien vitae pellentesque sem placerat in id. Pretium tellus duis convallis tempus leo eu aenean. Urna tempor pulvinar vivamus fringilla lacus nec metus. Iaculis massa nisl malesuada lacinia integer nunc posuere. Semper vel class aptent taciti sociosqu ad litora. Conubia nostra inceptos himenaeos orci varius natoque penatibus. Dis parturient montes nascetur ridiculus mus donec rhoncus. Nulla molestie mattis scelerisque maximus eget fermentum odio. Purus est efficitur laoreet mauris pharetra vestibulum fusce.'"></div>
        </div>

    </div>
</template>

<style scoped lang="scss">

.attitude-detail-container {
    padding: 25px 40px;
    font-family: 'Ubuntu Sans';
}

/* ---- HEADER ---- */
.header-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;

    .title {
        font-size: 22px;
        font-weight: 700;
        color: #008BD8;
    }

    .back-icon svg {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
}

/* ---- CHILD INFO ---- */
.child-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 35px;

    .child-left {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .child-name {
        color: #008BD8;
        font-size: 28px;
        font-weight: 700;
    }

    .child-score {
        font-size: 20px;
        font-weight: 600;
        color: #008BD8;

        span {
            color: #008BD8;
            font-weight: 700;
        }
    }

    .child-date {
        color: #7c7c7c;
        margin-top: 2px;
    }

    .child-code {
        color: #008BD8;
        font-size: 18px;
        font-weight: 600;
        margin-top: 5px;
        white-space: nowrap;
    }
}

/* ---- NOTE ---- */
.note-section {
    margin-top: 25px;

    label {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        display: block;
        color: #008BD8;
    }

    .note-content {
        background: #fff;
        border-radius: 10px;
        color: red;
        padding: 20px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.1);
        font-size: 16px;

        /* styling basic WYSIWYG output */
        p, span, div {
            line-height: 1.6;
        }

        ul, ol {
            padding-left: 25px;
            margin: 10px 0;
        }
    }
}

/* ---- RESPONSIVE ---- */
@media(max-width: 768px) {

    .child-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .child-code {
        margin-top: 10px;
    }

    .child-name {
        font-size: 24px;
    }

    .child-score {
        font-size: 18px;
    }

    .header-row .title {
        font-size: 20px;
    }

    .attitude-detail-container {
        padding: 20px;
    }
}

</style>
