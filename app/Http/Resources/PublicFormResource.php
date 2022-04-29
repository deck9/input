<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicFormResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'preview_image_path' => $this->preview_image_path,
            'brand_color' => $this->brand_color,
            'contrast_color' => $this->contrast_color,
            'privacy_link' => $this->privacy_link,
            'legal_notice_link' => $this->legal_notice_link,
            'eoc_text' => $this->eoc_text,
            'eoc_headline' => $this->eoc_headline,
            'cta_label' => $this->cta_label,
            'cta_link' => $this->cta_link,
            'cta_append_params' => $this->cta_append_params,
            'linkedin' => $this->linkedin,
            'github' => $this->github,
            'instagram' => $this->instagram,
            'facebook' => $this->facebook,
            'twitter' => $this->twitter,
            'show_cta_link' => $this->show_cta_link,
            'show_social_links' => $this->show_social_links,
            'is_published' => $this->is_published,
            'avatar' => $this->avatar,
            'company_name' => $this->company_name,
            'company_description' => $this->company_description,
        ];
    }
}
