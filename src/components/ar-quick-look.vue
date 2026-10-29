<template>
  <div class="quick-look">
    <!-- Safari requires a single image/picture child inside a rel="ar" link. -->
    <a
      class="quick-look-link"
      :href="modelUrl"
      :rel="supported ? 'ar' : undefined"
      :download="supported ? undefined : 'neuronapixel-logo.usdz'"
      :aria-label="label"
      :data-label="label"
      aria-describedby="quick-look-description"
    >
      <img src="/models/neuronapixel-logo.png" alt="" width="40" height="40" />
    </a>
    <p id="quick-look-description">
      {{
        supported
          ? t('quickLook.supportedDescription')
          : t('quickLook.unsupportedDescription')
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits<{ support: [supported: boolean] }>();
const supported = ref(false);
const label = computed(() => t('quickLook.action'));
const modelUrl = computed(
  () =>
    '/models/neuronapixel-logo.usdz' +
    (supported.value ? '#allowsContentScaling=0' : ''),
);

onMounted(() => {
  try {
    supported.value = document.createElement('a').relList.supports('ar');
  } catch {
    supported.value = false;
  }
  emit('support', supported.value);
});
</script>

<style scoped>
.quick-look {
  margin: 20px 0 8px;
}
.quick-look-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  box-sizing: border-box;
  padding: 4px 20px 4px 8px;
  border-radius: 28px;
  background: #1f2233;
  color: white;
  text-decoration: none;
  font-size: 15px;
}
.quick-look-link::after {
  content: attr(data-label);
}
.quick-look-link:focus-visible {
  outline: 3px solid #ff2f2f;
  outline-offset: 5px;
}
img {
  object-fit: contain;
}
p {
  max-width: 360px;
  font-size: 13px;
  line-height: 1.5;
  margin: 10px 0 0;
}
</style>
