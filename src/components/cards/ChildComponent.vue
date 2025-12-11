<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import child from '@/assets/images/child.png'
import CopyIcon from '@/components/shape/CopyIcon.vue';
import { useRouter } from 'vue-router';
import { workStore } from '@/stores/WorkStore';
import { authStore } from '@/stores/AuthStore';

const props = defineProps(['id', 'name', 'parentName', 'teacherName', 'method'])
const router = useRouter()

const handleWorkMode = (params) => {
    if (params == 'detail') {
        workStore.exitWorkMode()
        router.push({ name: 'childs.detail', params: { id: props.id } })
    } else {
        workStore.enterWorkMode()
        router.push({ name: 'childs.detail', params: { id: props.id } })
    }
}

</script>

<template>
    <div class="card">
        <div class="card-header">
            <img :src="child" alt="Child">
        </div>
        <div class="card-body">
            <p class="name">{{ props.name }}</p>
            <p class="parent" v-if="props.parentName && authStore.user.role == 1">{{ props.parentName }}</p>
            <p class="parent" v-else-if="props.teacherName && authStore.user.role == 2">{{ props.teacherName }}</p>
        </div>
        <div class="card-footer">
            <button-component label="Detail" size="full" @click="handleWorkMode('detail')" />
            <button-component label="Kerjakan Tugas" size="full" @click="handleWorkMode('work')"
                v-if="authStore.user.role == 1" />
            <button-component label="Hapus" display="border" size="full" @click="props.method(props.id)" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card {
    background-color: var(--White);
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 3.098px 34.083px 0 rgba(0, 0, 0, 0.10);
    color: var(--Secondary-900);

    .card-header {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        position: relative;
    }

    img {
        width: 10rem;
    }

    .name {
        font-size: 25px;
        font-weight: bold;
    }

    .button {
        margin-top: 20px;
    }
}
</style>