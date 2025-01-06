<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
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
    public function allCompanies(Request $request)
{
    \Log::info('CompanyController allCompanies method accessed'); // Debugging Log

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
public function addCompany(Request $request)
{
    \Log::info('Add Company Request: ', $request->all());

    $validated = $request->validate([
        'company_name' => 'required|string|max:255|unique:companies,company_name',
    ]);

    try {
        $company = Company::create([
            'company_name' => $validated['company_name'],
        ]);

        \Log::info('Company created: ', ['id' => $company->id]);

        return response()->json(['message' => 'Company created successfully.', 'company' => $company], 201);
    } catch (\Exception $e) {
        \Log::error('Error adding company: ', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json(['error' => 'Failed to create company.', 'details' => $e->getMessage()], 500);
    }
}
}
