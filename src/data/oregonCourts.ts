export interface CourtInfo {
  address: string;
  city: string;
  zip: string;
  phone: string;
  hours: string;
  filingCutoff: string;
}

export const OREGON_COURTS: Record<string, CourtInfo> = {
  "Baker": { address: "1995 3rd St", city: "Baker City", zip: "97814", phone: "(541) 523-6303", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Benton": { address: "120 NW 4th St", city: "Corvallis", zip: "97330", phone: "(541) 766-6828", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:30 PM" },
  "Clackamas": { address: "807 Main St", city: "Oregon City", zip: "97045", phone: "(503) 655-8447", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Clatsop": { address: "749 Commercial St", city: "Astoria", zip: "97103", phone: "(503) 325-8555", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Columbia": { address: "230 Strand St", city: "St. Helens", zip: "97051", phone: "(503) 397-2327", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Coos": { address: "250 N Baxter St", city: "Coquille", zip: "97423", phone: "(541) 396-8372", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Crook": { address: "300 NE 3rd St", city: "Prineville", zip: "97754", phone: "(541) 447-6541", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Curry": { address: "94235 Moore St", city: "Gold Beach", zip: "97444", phone: "(541) 247-4511", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:30 PM" },
  "Deschutes": { address: "1100 NW Bond St", city: "Bend", zip: "97703", phone: "(541) 388-5300", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Douglas": { address: "1036 SE Douglas Ave", city: "Roseburg", zip: "97470", phone: "(541) 957-2407", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Gilliam": { address: "221 S Water St", city: "Condon", zip: "97823", phone: "(541) 384-3572", hours: "8:30 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Grant": { address: "201 S Humbolt St", city: "Canyon City", zip: "97820", phone: "(541) 575-1438", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Harney": { address: "450 N Buena Vista Ave", city: "Burns", zip: "97720", phone: "(541) 573-5207", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Hood River": { address: "309 State St", city: "Hood River", zip: "97031", phone: "(541) 386-3535", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Jackson": { address: "100 S Oakdale Ave", city: "Medford", zip: "97501", phone: "(541) 776-7171", hours: "8:00 AM - 12:00 PM, 1:00 PM - 4:00 PM", filingCutoff: "3:30 PM" },
  "Jefferson": { address: "129 SW E St", city: "Madras", zip: "97741", phone: "(541) 475-3317", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Josephine": { address: "500 NW 6th St", city: "Grants Pass", zip: "97526", phone: "(541) 476-2309", hours: "8:00 AM - 12:00 PM, 1:00 PM - 4:00 PM", filingCutoff: "3:30 PM" },
  "Klamath": { address: "316 Main St", city: "Klamath Falls", zip: "97601", phone: "(541) 883-5503", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Lake": { address: "513 Center St", city: "Lakeview", zip: "97630", phone: "(541) 947-6051", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:30 PM" },
  "Lane": { address: "125 E 8th Ave", city: "Eugene", zip: "97401", phone: "(541) 682-4166", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Lincoln": { address: "225 W Olive St", city: "Newport", zip: "97365", phone: "(541) 265-4236", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Linn": { address: "300 SW 4th Ave", city: "Albany", zip: "97321", phone: "(541) 967-3802", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:30 PM" },
  "Malheur": { address: "251 B St W", city: "Vale", zip: "97918", phone: "(541) 473-5124", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Marion": { address: "100 High St NE", city: "Salem", zip: "97301", phone: "(503) 588-5105", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Morrow": { address: "100 S Court St", city: "Heppner", zip: "97836", phone: "(541) 676-5264", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Multnomah": { address: "1200 SW 1st Ave", city: "Portland", zip: "97204", phone: "(503) 988-3957", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Polk": { address: "850 Main St", city: "Dallas", zip: "97338", phone: "(503) 623-3154", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Sherman": { address: "500 Court St", city: "Moro", zip: "97039", phone: "(541) 565-3650", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Tillamook": { address: "201 Laurel Ave", city: "Tillamook", zip: "97141", phone: "(503) 842-2596", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Umatilla": { address: "216 SE 4th St", city: "Pendleton", zip: "97801", phone: "(541) 278-0341", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Union": { address: "1105 K Ave", city: "La Grande", zip: "97850", phone: "(541) 962-9500", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Wallowa": { address: "101 S River St", city: "Enterprise", zip: "97828", phone: "(541) 426-4991", hours: "8:30 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Wasco": { address: "511 Washington St", city: "The Dalles", zip: "97058", phone: "(541) 506-2700", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Washington": { address: "150 N First Ave", city: "Hillsboro", zip: "97124", phone: "(503) 846-8888", hours: "8:00 AM - 5:00 PM", filingCutoff: "4:00 PM" },
  "Wheeler": { address: "701 Adams St", city: "Fossil", zip: "97830", phone: "(541) 763-2541", hours: "8:00 AM - 12:00 PM, 1:00 PM - 4:00 PM", filingCutoff: "3:30 PM" },
  "Yamhill": { address: "535 NE 5th St", city: "McMinnville", zip: "97128", phone: "(503) 434-7530", hours: "8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM", filingCutoff: "4:00 PM" }
};
