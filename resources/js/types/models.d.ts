interface BaseModel {
    [key: string]: any;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
}

interface FormModel extends BaseModel {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    avatar_path: string | null;
    avatar: string | null;
    preview_image_path: string | null;
    brand_color: string | null;
    contrast_color: string | null;
    interaction_text_color: string | null;
    interaction_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    eoc_text: string | null;
    eoc_headline: string | null;
    data_retention_days: number | null;
    legal_notice_link: string | null;
    privacy_link: string | null;
    has_data_privacy: boolean;
    cta_label: string | null;
    cta_link: string | null;
    linkedin: string | null;
    github: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    show_cta_link: boolean;
    show_social_links: boolean;
    is_notification_via_mail: boolean;
    user_id: number;
    total_sessions: number;
    completion_rate: number;
    is_published: boolean;
    initials: string | null;
    published_at: string | null;
    deleted_at: string | null;
}

interface FormBlockModel extends BaseModel {
    type: FormBlockType;
    message: string | null;
    title: string | null;
    options: string | null;
    responses: string | null;
    has_parent_interaction: number | null;
    webhook_url: string;
    sequence: number;
    form_id: number;
    interactions: FormBlockInteractionModel[] | undefined;
}

type FormBlockType =
    | "none"
    | "consent"
    | "input-short"
    | "checkbox"
    | "radio"
    | "input-number"
    | "input-email"
    | "input-link"
    | "input-phone";

type FormBlockInteractionType = "button" | "input" | "consent";

interface FormBlockInteractionModel extends BaseModel {
    type: FormBlockInteractionType;
    label: string | null;
    reply: string | null;
    form_block_id: number;
    deleted_at: string | null;
}

type InteractionOption = {
    id?: number;
    label: string;
    value: FormBlockType;
    icon?: string;
};

type PublicFormBlockInteractionModel = {
    id: string;
    type: FormBlockInteractionType;
    label: string | null;
    reply: string | null;
};

type PublicFormBlockModel = {
    id: string;
    message: string | null;
    title: string | null;
    type: FormBlockType;
    interactions: Array<PublicFormBlockInteractionModel>;
};

type FormStoryboard = {
    count: integer;
    blocks: Array<PublicFormBlockModel>;
};
