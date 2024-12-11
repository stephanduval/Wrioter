<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function paginatedIndex(Request $request)
{
    $validated = $request->validate([
        'page' => 'integer|min:1',
        'itemsPerPage' => 'integer|min:1|max:100',
        'q' => 'nullable|string',
    ]);

    $page = $request->get('page', 1);
    $itemsPerPage = $request->get('itemsPerPage', 10);

    $companies = Company::query()
        ->when($request->get('q'), function ($query, $search) {
            $query->where('company_name', 'like', "%{$search}%");
        })
        ->paginate($itemsPerPage, ['*'], 'page', $page);

    $transformedCompanies = $companies->getCollection()->map(function ($company) {
        return [
            'id' => $company->id,
            'companyName' => $company->company_name,
        ];
    });

    $paginatedResponse = $companies->toArray();
    $paginatedResponse['data'] = $transformedCompanies->toArray();

    return response()->json($paginatedResponse);
}

public function index(Request $request)
    {
        \Log::info('CompanyController index method accessed');
        
        // Fetch and sort companies by 'company_name' in ascending order
        $companies = Company::query()
            ->when($request->get('q'), function ($query, $search) {
                $query->where('company_name', 'like', "%{$search}%");
            })
            ->orderBy('company_name', 'asc') // Sort companies alphabetically
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
