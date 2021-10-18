interface FormModel {
    [key: string]: any
}

interface FormModel {
    id: number
    uuid: string
    name: string
    description: string | null
    avatar_path: string | null
    avatar: string | null
    preview_image_path: string | null
    brand_color: string | null
    contrast_color: string | null
    interaction_text_color: string | null
    interaction_background_color: string | null
    user_message_text_color: string | null
    user_message_background_color: string | null
    user_message_text_color: string | null
    user_message_background_color: string | null
    eoc_text: string | null
    eoc_headline: string | null
    data_retention_days: number | null
    legal_notice_link: string | null
    privacy_link: string | null
    has_data_privacy: boolean
    cta_label: string | null
    cta_link: string | null
    linkedin: string | null
    github: string | null
    instagram: string | null
    facebook: string | null
    twitter: string | null
    show_cta_link: boolean
    show_social_links: boolean
    is_notification_via_mail: boolean
    user_id: number
    total_sessions: number
    completion_rate: number
    is_published: boolean
    initials: string | null
    published_at: string | null
    created_at: string | null
    updated_at: string | null
    deleted_at: string | null
}
interface FormBlockModel {
    [key: string]: any
}

interface FormBlockModel {
    id: number,
    uuid: string
    type: 'message' | 'consent' | 'input' | 'multiple' | 'click'
    message: string | null
    title: string | null
    options: string | null
    responses: string | null
    has_parent_interaction: number | null,
    webhook_url: string
    sequence: number
    form_id: number
    created_at: string | null
    updated_at: string | null
}
