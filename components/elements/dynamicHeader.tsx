import { SearchDetail } from '../../types/SearchResults'

export interface DynamicHeaderProps {
    gptAnswer: string
    query?: string
    wikiAnswer: SearchDetail | null
    mathAnswer: string | null
    images: SearchDetail[]
    continueSearch: () => void
}

export default function DynamicHeader(props: DynamicHeaderProps) {
    const { gptAnswer, query, wikiAnswer, mathAnswer, images, continueSearch } = props

    const devider = images.length / 3
    const imageColumn1 = images.slice(0, devider)
    const imageColumn2 = images.slice(devider, devider * 2)
    const imageColumn3 = images.slice(devider * 2, devider * 3)

    return (
        <>
            <div className="bg-neutral flex flex-row">
                <div className="min-h-12 card bg-neutral-focus m-1 basis-1/3">
                    <div className="card-body">
                        <span className="badge badge-accent">GPT answer</span>
                        <p className={ 'card-text whitespace-pre-wrap' }>{ gptAnswer }</p>
                        <div className={ 'card-actions justify-start ' }>
                            { gptAnswer && (<button className={ 'btn btn-primary ' }
                                                    onClick={ () => continueSearch() }>Continue</button>)
                            }
                        </div>
                    </div>
                </div>

                {
                    <div className="min-h-12 card bg-neutral-focus m-1 basis-1/3">
                        <div className="card-body ">
                            <span className="badge badge-accent">Wikipedia</span>
                            <h2 className="card-title">{ wikiAnswer?.title }</h2>
                            <p className={ 'card-text whitespace-pre-wrap' }>{ wikiAnswer?.description }</p>
                            <a href={ wikiAnswer?.url } className="link link-accent">{ wikiAnswer?.url }</a>
                        </div>
                    </div>
                }
                {
                    mathAnswer && <div className="min-h-12 card bg-neutral-focus m-1 basis-1/3">
                      <div className="card-body">
                          <span className="badge badge-accent">Math</span>
                          <p className={ 'card-text whitespace-pre-wrap' }>{ mathAnswer }</p>
                      </div>
                  </div>
                }
                {
                    images && images.length > 0 && <div className="min-h-12 card bg-neutral-focus m-1 basis-1/3">
                      <div className="carousel carousel-center">
                          { imageColumn1.map((image, index) => {
                              return (<div className="carousel-item" key={ index }>
                                  <a href={ image.url }>
                                      <img src={ image.thumbnail } alt="Burger"/>
                                  </a>
                              </div>)
                          })
                          }
                      </div>
                      <div className="carousel carousel-center">
                          { imageColumn2.map((image, index) => {
                              return (<div className="carousel-item" key={ index }>
                                  <a href={ image.url }>
                                      <img src={ image.thumbnail } alt="Burger"/>
                                  </a>
                              </div>)
                          })
                          }
                      </div>

                  </div>

                }

            </div>
        </>
    )
}
