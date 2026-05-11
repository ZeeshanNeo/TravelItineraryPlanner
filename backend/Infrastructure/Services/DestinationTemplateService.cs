using Application.Common.Interfaces;
using System.Collections.Generic;

namespace Infrastructure.Services;

public class DestinationTemplateService
{
    public IEnumerable<(string Name, int Quantity)> GetPackingItems(string destination, string travelType)
    {
        var items = new List<(string Name, int Quantity)>
        {
            ("Passport", 1),
            ("Travel Insurance", 1),
            ("Phone Charger", 1),
            ("Power Adapter", 1)
        };

        if (destination.ToLower().Contains("beach"))
        {
            items.Add(("Swimsuit", 2));
            items.Add(("Sunscreen", 1));
            items.Add(("Beach Towel", 1));
        }

        if (travelType.ToLower() == "business")
        {
            items.Add(("Formal Suit", 1));
            items.Add(("Business Cards", 20));
            items.Add(("Laptop", 1));
        }

        return items;
    }

    public IEnumerable<(string Task, int DaysBefore)> GetChecklistItems(string destination)
    {
        var tasks = new List<(string Task, int DaysBefore)>
        {
            ("Book flights", 60),
            ("Book accommodation", 45),
            ("Check passport validity", 90),
            ("Arrange travel insurance", 30)
        };

        if (destination.ToLower().Contains("international"))
        {
            tasks.Add(("Apply for Visa", 60));
            tasks.Add(("Check vaccinations", 60));
        }

        return tasks;
    }
}
