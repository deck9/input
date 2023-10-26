<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class Sequence implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        return $builder->orderBy('sequence', 'ASC');
    }
}
