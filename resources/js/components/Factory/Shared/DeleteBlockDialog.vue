<template>
  <DeleteDialog
    :show="check !== null"
    :title="title"
    :text="text"
    :note="note"
    :confirm-label="isGroup ? 'Delete group' : 'Delete question'"
    @close="emit('close')"
    @confirm="emit('confirm')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import DeleteDialog from "./DeleteDialog.vue";
import { DeleteCheck } from "./useDeleteBlock";
import { useForm } from "@/stores";
import { getTextFromHtml } from "@/utils";

const props = defineProps<{
  block: FormBlockModel;
  // open while set
  check: DeleteCheck | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const form = useForm();
const isGroup = computed(() => props.block.type === "group");
const groupName = (block: FormBlockModel) =>
  `“${block.title || "Unnamed group"}”`;

// as the editor counts: every block that isn't a group
const questions = (nodes: TreeNode[]): FormBlockModel[] =>
  nodes.flatMap((node) =>
    node.block.type === "group" ? questions(node.children) : [node.block],
  );
const numberOf = (uuid: string) =>
  questions(form.blocksTree).findIndex((item) => item.uuid === uuid) + 1;

const place = (uuid: string) => {
  const block = form.blocks?.find((item) => item.uuid === uuid);

  if (block?.type === "group") {
    return `group ${groupName(block)}`;
  }

  return block ? `question ${numberOf(uuid)}` : "";
};

const title = computed(() =>
  isGroup.value
    ? `Delete group ${groupName(props.block)}?`
    : "Delete question?",
);

const text = computed(() => {
  if (isGroup.value) {
    const count = props.check?.questions ?? 0;
    const kids =
      count === 1
        ? "1 question and its answers"
        : `${count} questions and their answers`;

    return count
      ? `Its ${kids} will be deleted too. This can't be undone.`
      : "The group is empty. This can't be undone.";
  }

  const plain = getTextFromHtml(props.block.message ?? "").trim();
  const short = plain.length > 80 ? `${plain.slice(0, 78).trim()}…` : plain;
  const quoted = short ? `“${short}”` : "";
  const number = numberOf(props.block.uuid);
  // the number first: a copy from Duplicate has the same text
  const name = number
    ? `Question ${number}${quoted ? ` (${quoted})` : ""}`
    : quoted || "The question";
  const answers = props.check?.answers;
  // unknown when the counts couldn't load: there may still be answers
  const withAnswers =
    answers === undefined
      ? " and its answers"
      : answers
        ? ` and its ${answers} ${answers === 1 ? "answer" : "answers"}`
        : "";

  return `${name}${withAnswers} will be deleted. This can't be undone.`;
});

const note = computed(() => {
  const rules = props.check?.usedBy ?? [];

  if (!rules.length) {
    return "";
  }

  const places = [...new Set(rules.map((rule) => place(rule.block)))]
    .filter(Boolean)
    .join(", ");
  const uses = rules.length === 1 ? "1 rule uses" : `${rules.length} rules use`;

  return `${uses} this ${isGroup.value ? "group" : "question"} and will stop working${places ? `: ${places}` : ""}.`;
});
</script>
