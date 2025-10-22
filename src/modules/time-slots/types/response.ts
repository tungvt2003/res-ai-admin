import { ApiResponse } from "../../../shares/types/response";
import { TimeSlot } from "./time-slot";

type ListTimeSlotsResponse = ApiResponse<TimeSlot[]>;
type GetTimeSlotResponse = ApiResponse<TimeSlot>;
type CreateTimeSlotResponse = ApiResponse<TimeSlot>;
type UpdateTimeSlotResponse = ApiResponse<TimeSlot>;
type DeleteTimeSlotResponse = ApiResponse<null>;
type CreateMultiShiftSlotsResponse = ApiResponse<TimeSlot[]>;

export {
  ListTimeSlotsResponse,
  GetTimeSlotResponse,
  CreateTimeSlotResponse,
  UpdateTimeSlotResponse,
  DeleteTimeSlotResponse,
  CreateMultiShiftSlotsResponse,
};
