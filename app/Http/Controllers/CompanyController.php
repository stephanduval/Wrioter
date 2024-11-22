<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('CompanyController index method accessed');
        $companies = Company::query()
            ->when($request->get('q'), function ($query, $search) {
                $query->where('company_name', 'like', "%{$search}%");
            })
            ->get();

        // Transform companies data
        $transformedCompanies = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'companyName' => $company->company_name,
                'createdAt' => $company->created_at,
                'updatedAt' => $company->updated_at,
            ];
        });

        return response()->json($transformedCompanies, 200, ['Content-Type' => 'application/json']);
    }
}
