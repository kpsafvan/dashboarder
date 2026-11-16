<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <XIcon class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md">
          <UploadCloudIcon class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Upload Strava Export</h2>
          <p class="text-xs text-slate-400">Accepts either activities.csv or full Strava export archive .zip</p>
        </div>
      </div>

      <!-- Drop Zone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/50'
        ]"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.zip"
          class="hidden"
          @change="handleFileChange"
        />

        <div class="flex flex-col items-center justify-center gap-3">
          <div class="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
            <FileArchiveIcon class="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-200">
              Drop your <span class="text-orange-400">activities.csv</span> or <span class="text-orange-400">export.zip</span> here
            </p>
            <p class="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">.CSV</span>
            <span class="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">.ZIP Archive</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.isLoading" class="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3 text-orange-400">
        <Loader2Icon class="w-5 h-5 animate-spin" />
        <span class="text-xs font-semibold">Parsing workouts and computing analytics...</span>
      </div>

      <!-- Error State -->
      <div v-if="store.error" class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
        ⚠️ {{ store.error }}
      </div>

      <!-- Demo Data Action -->
      <div class="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-slate-200">Don't have an export handy?</p>
          <p class="text-[11px] text-slate-400">Load our realistic 3-year sample dataset (750 activities)</p>
        </div>
        <button
          @click="loadDemo"
          :disabled="store.isLoading"
          class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
        >
          <span>⚡ Load Demo Data</span>
        </button>
      </div>

      <!-- Privacy Notice -->
      <div class="mt-4 text-center">
        <p class="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheckIcon class="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Client-side. Your fitness data never leaves your browser.</span>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStravaStore } from '../stores/stravaStore';
import {
  X as XIcon,
  UploadCloud as UploadCloudIcon,
  FileArchive as FileArchiveIcon,
  Loader2 as Loader2Icon,
  ShieldCheck as ShieldCheckIcon,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const store = useStravaStore();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

async function handleFile(file: File) {
  try {
    await store.loadFile(file);
    emit('close');
  } catch (err) {
    console.error(err);
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0]);
  }
}

async function loadDemo() {
  try {
    await store.loadDemoData();
    emit('close');
  } catch (err) {
    console.error(err);
  }
}
</script>
