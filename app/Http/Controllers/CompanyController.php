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
        'itemsPerPage' => 'string|in:all,10,25,50,100',  // Updated validation
        'q' => 'nullable|string',
    ]);

    $page = $request->get('page', 1);
    $itemsPerPage = $request->get('itemsPerPage', '10');

    $query = Company::query()
        ->when($request->get('q'), function ($query, $search) {
            $query->where('company_name', 'like', "%{$search}%");
        });

    // Handle 'all' items per page
    if ($itemsPerPage === 'all') {
        $companies = $query->get();
        $transformedCompanies = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'companyName' => $company->company_name,
            ];
        });

        return response()->json([
            'data' => $transformedCompanies->toArray(),
            'total' => $companies->count(),
            'current_page' => 1,
            'per_page' => $companies->count(),
            'last_page' => 1,
            'from' => 1,
            'to' => $companies->count(),
        ]);
    }

    // Handle paginated results
    $companies = $query->paginate((int) $itemsPerPage, ['*'], 'page', $page);
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
public function deleteCompany($id)
{
    try {
        $company = Company::findOrFail($id);

        // Use a transaction if there are related data to ensure data integrity
        \DB::transaction(function () use ($company) {
            $company->delete();
        });

        return response()->json(['message' => 'Company deleted successfully.'], 200);
    } catch (\Exception $e) {
        \Log::error('Error deleting company: ', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to delete company.'], 500);
    }
}   
public function showCompany($id)
{
    try {
        $company = Company::findOrFail($id);

        return response()->json([
            'id' => $company->id,
            'companyName' => $company->company_name,
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching company details: ', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Company not found.'], 404);
    }
}

public function updateCompany(Request $request, $id)
{
    try {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:companies,company_name,' . $id,
        ]);

        $company = Company::findOrFail($id);
        $company->update(['company_name' => $validated['company_name']]);

        return response()->json(['message' => 'Company updated successfully.', 'company' => $company]);
    } catch (\Exception $e) {
        \Log::error('Error updating company: ', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to update company.', 'details' => $e->getMessage()], 500);
    }
}
}
