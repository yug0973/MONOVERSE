import { ALL_FLATS, BUILDING_FLOORS, getFlatById } from '../data/buildingData';
import { PROJECT_DATA } from '../data/projectData';
import { FlatData, FloorData, ProjectMetadata } from '../types/building';
import { SiteVisitEnquiry } from '../types/enquiry';
import { getStoredEnquiries, saveEnquiry, updateEnquiryStatus } from './mockStorage';

/**
 * Clean typed API layer.
 * A real backend (NestJS/Go/FastAPI) can drop in here in the future
 * by swapping internal fetch calls without touching any UI component.
 */
export const api = {
  async getProjectMetadata(): Promise<ProjectMetadata> {
    await simulateNetworkDelay(40);
    return PROJECT_DATA;
  },

  async getAllFloors(): Promise<FloorData[]> {
    await simulateNetworkDelay(60);
    return BUILDING_FLOORS;
  },

  async getAllFlats(): Promise<FlatData[]> {
    await simulateNetworkDelay(50);
    return ALL_FLATS;
  },

  async getFlat(flatId: string): Promise<FlatData | null> {
    await simulateNetworkDelay(30);
    return getFlatById(flatId) || null;
  },

  async submitSiteVisitEnquiry(
    payload: Omit<SiteVisitEnquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<SiteVisitEnquiry> {
    await simulateNetworkDelay(250);
    const newEnquiry: SiteVisitEnquiry = {
      ...payload,
      id: `enq-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };
    saveEnquiry(newEnquiry);
    return newEnquiry;
  },

  async getLeads(): Promise<SiteVisitEnquiry[]> {
    await simulateNetworkDelay(100);
    return getStoredEnquiries();
  },

  async updateLeadStatus(
    id: string,
    status: SiteVisitEnquiry['status']
  ): Promise<void> {
    await simulateNetworkDelay(120);
    updateEnquiryStatus(id, status);
  },
};

function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
