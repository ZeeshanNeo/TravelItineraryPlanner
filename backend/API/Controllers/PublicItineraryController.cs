using Application.DTOs.Itinerary;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/public/itineraries")]
    public class PublicItineraryController : ControllerBase
    {
        private readonly IItineraryService _itineraryService;

        public PublicItineraryController(IItineraryService itineraryService)
        {
            _itineraryService = itineraryService;
        }

        [HttpGet("{shareToken}")]
        public async Task<ActionResult<ItineraryResponse>> GetPublicItinerary(string shareToken)
        {
            var result = await _itineraryService.GetPublicItineraryAsync(shareToken);
            if (result.IsSuccess) return Ok(result.Value);
            return NotFound(new { error = result.Error });
        }
    }
}
