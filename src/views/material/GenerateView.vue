<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import AudioPlayerComponent from '@/components/fields/AudioPlayerComponent.vue';
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import EyeIcon from '@/components/shape/EyeIcon.vue';

import { useMaterialStore } from '@/stores/GenerateMaterialStore';
import api from '@/utils/api';
import { ref, reactive, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { triggerToast } from '@/utils/toast'; // Pastikan import ini ada jika pakai toast

// --- CONFIG ---
const apiUrl = import.meta.env.VITE_APP_API_URL
const materialStore = useMaterialStore();
const route = useRoute();
const id = route.params.id;

// --- STATE ---
const chatContainer = ref(null);
const isGenerating = ref(false);
const isPreviewOpen = ref(false);
const previewContent = ref(null);

// --- DATA MASTER (Disederhanakan) ---
const availableMethods = [
    { label: 'Reading (Membaca)', value: 1 },
    { label: 'Writing (Menulis)', value: 2 },
    { label: 'Audio (Dikte)', value: 3 },
    { label: 'Ordering Sentences', value: 4 },
    { label: 'Rapid Naming', value: 5 },
    { label: 'Aritmatic', value: 6 }
];

const form = reactive({
    method: '',
    description: ''
});

const messages = ref([
    {
        id: 1,
        sender: 'ai',
        type: 'intro',
        content: 'Halo! Silakan pilih Metode, lalu berikan deskripsi untuk generate materi.'
    }
]);

// --- HANDLERS ---

// 1. Helper: Check Youtube URL
const isYoutubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

// 2. Helper: Scroll Chat
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' });
        }
    });
};

// 3. Generate Material
const handleGenerate = async () => {
    if (!form.method || !form.description) {
        triggerToast("Mohon lengkapi semua form input.", 'error');
        return;
    }

    // Cari label berdasarkan ID yang dipilih
    const selectedMethodObj = availableMethods.find(item => item.value === form.method);
    const methodLabel = selectedMethodObj ? selectedMethodObj.label : 'Unknown Method';

    // Snapshot request untuk UI user
    const currentRequestSnapshot = {
        method: methodLabel,
        methodId: form.method,
        description: form.description
    };

    // Tampilkan chat user
    messages.value.push({
        id: Date.now(),
        sender: 'user',
        content: { ...currentRequestSnapshot }
    });

    scrollToBottom();
    isGenerating.value = true;

    try {
        const payload = {
            method: parseInt(form.method),
            description: form.description,
        };

        const res = await api.post(`/materials/create/generate`, payload);
        const jsonResult = res.data;

        if (jsonResult.success && jsonResult.data && jsonResult.data.material) {
            const mat = jsonResult.data.material;

            messages.value.push({
                id: Date.now() + 1,
                sender: 'ai',
                type: 'result',
                isSaved: false,
                savedData: null,
                requestContext: currentRequestSnapshot,
                content: {
                    title: mat.title || `Materi ${methodLabel}`,
                    description: mat.description,
                    images: mat.images,
                    content: mat.content,
                    videoUrl: mat.videoUrl || mat.link,
                    readedText: mat.readedText,
                }
            });
        } else {
            throw new Error(jsonResult.message || "Gagal mendapatkan data material.");
        }
    } catch (error) {
        console.error("Generate Error:", error);
        messages.value.push({
            id: Date.now() + 1,
            sender: 'ai',
            type: 'intro',
            content: `Maaf, terjadi kesalahan: ${error.message}`
        });
    } finally {
        isGenerating.value = false;
        form.method = ''; // Reset form
        form.description = ''; // Reset form
        scrollToBottom();
    }
};

// 4. Save Material
const handleSaveMaterial = async (msgIndex) => {
    const msg = messages.value[msgIndex];

    const payload = {
        childrenId: route.params.id,
        method_id: msg.requestContext.methodId,
        title: msg.content.title,
        description: msg.content.description,
        content: msg.content.content,
        videoUrl: msg.content.videoUrl || '',
        readedText: msg.content.readedText || '',
        images: msg.content.images
    };

    const result = await materialStore.saveGeneratedMaterial(payload);

    if (result.success) {
        messages.value[msgIndex].isSaved = true;
        messages.value[msgIndex].savedData = payload;
        triggerToast("Materi berhasil disimpan.", 'success');
    } else {
        triggerToast("Gagal menyimpan materi.", 'error');
    }
};

// 5. Preview & Close
const handlePreview = (msgIndex) => {
    const msg = messages.value[msgIndex];

    if (msg.savedData) {
        let finalMediaUrl = null;
        let isYoutube = false;

        // Cek Video
        if (msg.savedData.videoUrl) {
            finalMediaUrl = msg.savedData.videoUrl;
            if (typeof finalMediaUrl === 'string' && (finalMediaUrl.includes('youtube') || finalMediaUrl.includes('youtu.be'))) {
                isYoutube = true;
            }
        }
        // Cek Gambar (ambil gambar pertama jika ada)
        else if (msg.savedData.images && msg.savedData.images.length > 0) {
            // Jika API mengembalikan array string nama file
            finalMediaUrl = `${apiUrl}/api/v1/image/material/${msg.savedData.images[0]}`;
        }

        previewContent.value = {
            method_label: msg.requestContext.method,
            title: msg.savedData.title,
            content_text: msg.savedData.content,
            readedText: msg.savedData.readedText,
            media_url: finalMediaUrl,
            is_youtube: isYoutube
        };

        isPreviewOpen.value = true;
    }
};

const closePreview = () => {
    isPreviewOpen.value = false;
    previewContent.value = null;
};
</script>

<template>
    <div class="chat-layout-container">

        <div v-if="isPreviewOpen" class="modal-overlay" @click.self="closePreview">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Preview Materi</h3>
                    <button class="close-btn" @click="closePreview">&times;</button>
                </div>
                <div class="modal-body" v-if="previewContent">
                    <div class="meta-tags">
                        <span class="badge">{{ previewContent.method_label }}</span>
                    </div>

                    <h2 class="preview-title">{{ previewContent.title }}</h2>

                    <div class="media-container" v-if="previewContent.media_url">
                        <iframe v-if="previewContent.is_youtube" width="100%" height="300"
                            :src="previewContent.media_url.replace('watch?v=', 'embed/')" frameborder="0"
                            allowfullscreen>
                        </iframe>
                        <div v-else>
                            <img :src="previewContent.media_url" alt="Materi Visual"
                                style="width: 100%; object-fit: contain;" />
                        </div>
                    </div>

                    <div class="media-container" v-if="previewContent.readedText">
                        <p style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">Audio Preview:</p>
                        <AudioPlayerComponent :text="previewContent.readedText" :autoplay="false"
                            displayStyle="player" />
                    </div>

                    <div class="text-content">
                        <div v-html="previewContent.content_text"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <ButtonComponent label="Tutup" size="small" display="border" @click="closePreview" />
                </div>
            </div>
        </div>

        <header class="page-header">
            <div class="header-content">
                <router-link :to="{ name: 'childs.detail', params: { id: id } }" class="back-btn">
                    <ChevronLeftIcon />
                </router-link>
                <h1 class="page-title">AI Material Generator</h1>
            </div>
        </header>

        <main class="main-content">
            <div class="chat-window" ref="chatContainer">
                <div class="messages-wrapper">

                    <div v-for="(msg, index) in messages" :key="msg.id" :class="['message-row', msg.sender]">

                        <div class="avatar">
                            <span v-if="msg.sender === 'ai'">🤖</span>
                            <span v-else>👤</span>
                        </div>

                        <div class="bubble">
                            <div v-if="msg.type === 'intro'">
                                <p>{{ msg.content }}</p>
                            </div>

                            <div v-else-if="msg.sender === 'user'">
                                <div class="request-summary">
                                    <span class="badge">{{ msg.content.method }}</span>
                                </div>
                                <p class="request-text">{{ msg.content.description }}</p>
                            </div>

                            <div v-else-if="msg.type === 'result'" class="result-content">

                                <div class="result-header">
                                    <h4 class="res-title">{{ msg.content.title }}</h4>
                                    <div class="res-desc" v-html="msg.content.description"></div>
                                </div>

                                <hr class="divider" />

                                <div class="res-main-content">
                                    <div class="content-body" v-html="msg.content.content"></div>
                                </div>

                                <div class="media-section">
                                    <div class="media-item" v-if="msg.content.readedText">
                                        <p class="media-label">Dengarkan Audio:</p>
                                        <AudioPlayerComponent :text="msg.content.readedText" :autoplay="false"
                                            displayStyle="player" />
                                    </div>

                                    <div class="media-item" v-if="msg.content.images && msg.content.images.length > 0">
                                        <div class="image-grid">
                                            <img v-for="(img, idx) in msg.content.images" :key="idx"
                                                :src="`${apiUrl}/api/v1/image/material/${img}`" alt="Visual Material" />
                                        </div>
                                    </div>

                                    <div class="media-item" v-if="msg.content.videoUrl">
                                        <div v-if="isYoutubeUrl(msg.content.videoUrl)" class="video-wrapper">
                                            <iframe width="100%" height="200"
                                                :src="msg.content.videoUrl.replace('watch?v=', 'embed/')"
                                                frameborder="0" allowfullscreen>
                                            </iframe>
                                        </div>
                                        <div v-else class="link-wrapper">
                                            <a :href="msg.content.videoUrl" target="_blank" class="external-link">
                                                🔗 Buka Video/Link Materi
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div class="actions">
                                    <ButtonComponent v-if="!msg.isSaved" label="Simpan ke Library" class="primary"
                                        size="small" display="fill" :isDisabled="materialStore.isLoading"
                                        @click="handleSaveMaterial(index)" />

                                    <ButtonComponent v-else label="Tersimpan ✓" size="small" display="border"
                                        :isDisabled="true"
                                        style="border-color: var(--Success-500); color: var(--Success-500);" />

                                    <ButtonComponent v-if="msg.isSaved" label="Preview" size="small" type="secondary"
                                        display="fill" @click="handlePreview(index)">
                                        <template #icon>
                                            <EyeIcon />
                                        </template>
                                    </ButtonComponent>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="isGenerating" class="message-row ai">
                        <div class="avatar">🤖</div>
                        <div class="bubble loading-bubble">
                            <div class="typing-dots"><span></span><span></span><span></span></div>
                            <small>Sedang menyusun materi...</small>
                        </div>
                    </div>

                </div>
            </div>

            <div class="input-area-wrapper">
                <div class="input-card">
                    <div class="input-grid">
                        <div class="form-group">
                            <label>Metode</label>
                            <select v-model="form.method">
                                <option value="" disabled>Pilih Metode</option>
                                <option v-for="m in availableMethods" :key="m.value" :value="m.value">
                                    {{ m.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <textarea v-model="form.description"
                            placeholder="Contoh: Buatkan materi tentang hewan laut..."></textarea>
                    </div>
                    <div class="action-bar">
                        <ButtonComponent @click="handleGenerate" :isDisabled="isGenerating"
                            :label="isGenerating ? '...' : 'Generate'" size="small" />
                    </div>
                </div>
            </div>

        </main>
    </div>
</template>

<style lang="scss" scoped>
// --- GLOBAL VARS ---
.chat-layout-container {
    --White: #FFFFFF;
    --Soft-white: #F9FAFB;
    --Primary-900: #FF3C8A;
    --Primary-500: #FF70A9;
    --Secondary-900: #008BD8;
    --Secondary-500: #3ABFF8;
    --Success-500: #22C55E;
    --Neutral-100: #E5E7EB;
    --Neutral-300: #9CA3AF;
    --Neutral-500: #6B7280;
    --Neutral-700: #374151;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

// --- LAYOUT HEADER & MAIN ---
.page-header {
    flex-shrink: 0;
    padding: 1rem 2rem;
    border-bottom: 1px solid var(--Neutral-100);

    .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 900px;
        margin: 0 auto;
    }

    .page-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--Primary-900);
        font-family: 'Ubuntu Sans', sans-serif;
    }

    .back-btn {
        display: flex;
        align-items: center;
        color: var(--Neutral-700);
    }
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

// --- CHAT WINDOW AREA ---
.chat-window {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--Neutral-300);
        border-radius: 20px;
        border: 3px solid transparent;
        background-clip: content-box;
    }
}

.messages-wrapper {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 1rem;
}

// --- MESSAGE BUBBLES ---
.message-row {
    display: flex;
    gap: 1rem;

    &.user {
        flex-direction: row-reverse;

        .bubble {
            background-color: var(--Primary-500);
            color: white;
            border-radius: 1.2rem 1.2rem 0.2rem 1.2rem;
        }

        .request-text {
            color: white;
        }
    }

    &.ai {
        .bubble {
            background-color: var(--White);
            border: 1px solid var(--Neutral-100);
            border-radius: 0.2rem 1.2rem 1.2rem 1.2rem;
            box-shadow: var(--shadow);
        }
    }

    .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--Neutral-100);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 1.2rem;
    }

    .bubble {
        padding: 1.25rem;
        max-width: 100%;
        line-height: 1.6;
        font-size: 0.95rem;

        .request-summary {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.5rem;

            .badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
            }
        }
    }
}

// --- RESULT CONTENT STYLING ---
.result-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .result-header {
        margin-bottom: 0.5rem;

        .res-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--Neutral-700);
            margin: 0;
        }

        .res-desc {
            font-size: 0.85rem;
            color: var(--Neutral-500);
            margin-top: 4px;
        }
    }

    .divider {
        border: none;
        border-top: 1px solid var(--Neutral-100);
        margin: 0;
    }

    .res-main-content {
        background-color: var(--Soft-white);
        border-left: 4px solid var(--Secondary-900);
        padding: 1rem;
        border-radius: 4px;

        .content-body {
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--Neutral-700);

            :deep(p) {
                margin-bottom: 0.5rem;
            }

            :deep(b),
            :deep(strong) {
                color: var(--Secondary-900);
            }
        }
    }

    .media-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .media-item {
            .media-label {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--Neutral-500);
                margin-bottom: 0.5rem;
            }
        }

        .image-grid {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;

            img {
                max-width: 100%;
                border-radius: 8px;
                border: 1px solid var(--Neutral-100);
            }
        }

        .video-wrapper {
            border-radius: 8px;
            overflow: hidden;
        }

        .external-link {
            display: inline-block;
            padding: 8px 12px;
            background: var(--Neutral-100);
            color: var(--Secondary-900);
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.9rem;
            transition: background 0.2s;

            &:hover {
                background: var(--Neutral-300);
            }
        }
    }

    .actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
}

// --- INPUT AREA STYLING ---
.input-area-wrapper {
    flex-shrink: 0;
    background-color: var(--White);
    border-top: 1px solid var(--Neutral-100);
    padding: 1.5rem;
    width: 100%;
    z-index: 10;

    .input-card {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .input-grid {
        display: grid;
        grid-template-columns: 100%; // Satu kolom saja
        gap: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--Neutral-700);
        }

        select,
        textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--Neutral-300);
            border-radius: 8px;
            outline: none;
            font-family: inherit;

            &:focus {
                border-color: var(--Secondary-900);
                box-shadow: 0 0 0 2px var(--Secondary-500);
            }
        }

        textarea {
            height: 50px;
            resize: none;
        }
    }

    .action-bar {
        display: flex;
        justify-content: flex-end;
    }
}

// --- ANIMATIONS ---
.loading-bubble .typing-dots {
    display: flex;
    gap: 4px;

    span {
        width: 6px;
        height: 6px;
        background: var(--Neutral-700);
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;

        &:nth-child(1) {
            animation-delay: -0.32s;
        }

        &:nth-child(2) {
            animation-delay: -0.16s;
        }
    }
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

// --- MODAL STYLES ---
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
}

.modal-content {
    background: var(--White);
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;

    .modal-header {
        padding: 1.25rem;
        border-bottom: 1px solid var(--Neutral-100);
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-family: 'Ubuntu Sans';
            color: var(--Primary-900);
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;

        .meta-tags {
            display: flex;
            gap: 8px;
            margin-bottom: 1rem;

            .badge {
                background: var(--Neutral-100);
                color: var(--Neutral-700);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
            }
        }

        .preview-title {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: #1F2937;
        }

        .media-container {
            margin-bottom: 1.5rem;
            border-radius: 8px;
            overflow: hidden;

            img,
            iframe {
                width: 100%;
                display: block;
            }
        }

        .text-content {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--Neutral-700);
            white-space: pre-wrap;
        }
    }

    .modal-footer {
        padding: 1.25rem;
        border-top: 1px solid var(--Neutral-100);
        display: flex;
        justify-content: flex-end;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>