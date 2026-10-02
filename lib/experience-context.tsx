'use client';
import { createContext, useContext } from 'react';
import { newExperience, type ExperienceConfig } from './experience';
export const ExperienceContext=createContext<ExperienceConfig>(newExperience());
export const useExperience=()=>useContext(ExperienceContext);
