<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

use function Symfony\Component\Translation\t;

class PropertySearchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'city_id' => 'nullable|integer|exists:cities,id',
            'area_id' => 'nullable|integer|exists:areas,id',
            'gender_requirement' => 'nullable|string|in:male,female,mixed',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'accommodation_type' => 'nullable|string',
            'university' => 'nullable|string',
            'beds' => 'nullable|integer|min:1',
            'bathrooms_count' => 'nullable|integer|min:1',
            'keyword' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
        ];
    }
}
