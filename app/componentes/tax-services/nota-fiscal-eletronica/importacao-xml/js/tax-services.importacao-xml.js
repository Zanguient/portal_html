/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.9 - 01/04/2016
 *  - Atualizações Fernando
 *
 *  Versão 1.0.8 - 14/03/2016
 *  - Atualizações Fernando
 *
 *  Versão 1.0.7 - 18/12/2015
 *  - Opção de importar aparecer apenas para o PETROX
 *
 *  Versão 1.0.6 - 25/11/2015
 *  - Atualizações Fernando
 *
 *  Versão 1.0.5 - 19/11/2015
 *  - Não retorna para a tela de login quando ocorrer erro 503 ou 404. Notifica a indisponibilidade do serviço
 *
 *  Versão 1.0.4 - 25/09/2015
 *  - Notifica acesso de tela 
 *
 *  Versão 1.0.3 - 23/09/2015
 *  - Filtro por Chave de acesso (Inserção na div sem as funcionalidades).  
 *
 *  Versão 1.0.2 - 22/09/2015
 *  - Função download deslocada para app.js
 *  - Filtro por data de recebimento
 *
 *  Versão 1.0.1 - 18/09/2015
 *  - Busca somente filiais ativas
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("tax-services-importacao-xml", []) 

.controller("tax-services-importacao-xmlCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            'Upload',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,Upload,$filter){ 
   
    $scope.paginaInformada = 1;
    $scope.filiais = [];   
    $scope.manifestos = [];
    $scope.almoxarifados = [];
    $scope.natOperacoes = [];
    $scope.Mensagens = [];
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.statusmanifesto = [/*{id: 1, nome : 'MANIFESTO'},
                                {id: 2, nome : 'ERP'}*/];                                        
    $scope.filtro = { datamin : new Date(), datamax : '', data : 'Recebimento',
                      statusmanifesto : null, destinatario : null, emitente : '',
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, chaveAcesso : null}; 
    $scope.total = { nfe : 0 };  
    $scope.notadetalhada = undefined;  
    $scope.nrChave = ''; //chave da nota para importação
    $scope.dadosImportacao = {}; //Dados para importação da NFe
    $scope.uploadXml = {cdGrupo:'',xml:''};
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyManifestoPos = 1; // posição da div que vai receber o loading progress                                         
    // flags
    var ultimoFiltroBusca = undefined;
    $scope.tab = 1;
    $scope.tabFiltro = 1;                                            
    $scope.exibeTela = false;                                         
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;
    $scope.abrirCalendarioDataEntrada = false;
                                                
    // Inicialização do controller
    $scope.taxServices_importacaoXMLInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Importação XML';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.destinatario = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            buscaFiliais();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        //buscaFiliais();
    };                                           
                                                
                                            
       $scope.importaXml = function(){
       if($scope.uploadXml.xml && $scope.uploadXml.xml !== null){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }  
           $scope.showProgress();
       Upload.upload({
                //url: $apis.getUrl($apis.administracao.tbempresa, undefined, { id : 'token', valor : $scope.token }),
                url: $apis.getUrl($apis.tax.tbmanifesto, $scope.token, 
                                  [
                                   { id: /*tax.tbmanifesto.cdGrupo*/ 103, 
                                     valor : $scope.usuariologado.grupoempresa.id_grupo}
                                  ]),
                file: $scope.uploadXml.xml,
                method: 'PATCH',
            }).success(function (data, status, headers, config) {
                $timeout(function() {
                    $scope.hideProgress();
                    // Avalia se o arquivo enviado é válido
                    if(data && data != null){
                        if(data.cdMensagem === 200){
                            $scope.tabFiltro = 2
                            $scope.filtro.chaveAcesso = data.dsMensagem;
                            buscaManifestos();
                            //$scope.showAlert('Upload realizado com sucesso!', true, 'success', true);
                        }else{
                            $scope.showModalAlerta(data.dsMensagem);    
                        }
                    }
                });
            }).error(function (data, status, headers, config){
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 //else if(status === 500) $scope.showModalAlerta("Só é aceito arquivo XML!");
                 else $scope.showAlert("Houve uma falha ao fazer upload do XML da Nota Fiscal (" + status + ")", true, 'danger', true, false);
                //uploadEmProgresso = false;
                $scope.hideProgress();
            });
           }
   }
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaManifestos(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.manifestos.length > 0) buscaManifestos();    
    };
                                                
                                                
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Filtros Por Data
       if($scope.tabFiltro === 1)
       {
           var filtroData = undefined;
           // Data
           if($scope.filtro.data === 'Emissão'){ 
               //console.log("Emissão");
               filtroData = {id: /*$campos.tax.tbmanifesto.dtEmissao*/ 108,
                             valor: $scope.getFiltroData($scope.filtro.datamin)};
           }else{ 
               //console.log("Recebimento");
               filtroData = {id: /*$campos.tax.tbmanifesto.dtEntrega*/ 120,
                             valor: $scope.getFiltroData($scope.filtro.datamin)}; 
           }

           if($scope.filtro.datamax)
               filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
           filtros.push(filtroData);

           // Destinatário
           if($scope.filtro.destinatario && $scope.filtro.destinatario !== null){
               filtros.push({id: /*$campos.tax.tbmanifesto.nrCNPJ*/ 104, 
                             valor: $scope.filtro.destinatario.nu_cnpj});  
           }

            // Emitente
            if($scope.filtro.emitente && $scope.filtro.emitente !== ''){
                filtros.push({id: /*$campos.card.tbmanifesto.nmEmitente */ 105,
                              valor: $scope.filtro.emitente});
            }

            // Status Manifesto
            if($scope.filtro.statusmanifesto && $scope.filtro.statusmanifesto !== null){
                filtros.push({id: /*$campos.tax.tbmanifesto.cdSituacaoManifesto */ 113,
                              valor: $scope.filtro.statusmanifesto.id}); 
            }
       }else
       {
           if($scope.filtro.chaveAcesso && $scope.filtro.chaveAcesso !== null){
               filtros.push({id: /*$campos.tax.tbmanifesto.nrCNPJ*/ 101, 
                             valor: $scope.filtro.chaveAcesso}); 
           }
       }
        return filtros.length > 0 ? filtros : undefined;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        ultimoFiltroBusca = undefined;
        
        $scope.filtro.destinatario = $scope.filtro.statusmanifesto = null; 
        
        $scope.filtro.emitente = '';
        
        $scope.filtro.chaveAcesso = '';

    }
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.destinatario = null;
                else $scope.filtro.destinatario = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouDestinatario = function(){
        //console.log($scope.filtro.destinatario); 
    }; 
                                                
                                                
                                                
    
                                                
    // MANIFESTO
    $scope.incrementaTotalNFes = function(totalNotas){
        if(typeof totalNotas === 'number') $scope.total.nfe += totalNotas;    
    }
    /**
      * Obtem os manifestos a partir dos filtros
      */
    $scope.buscaManifestos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        /*if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }*/
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        // Nova busca
        buscaManifestos();
    }
                                                
                                                
    var buscaManifestos = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       if( filtros !=  undefined)
       {
           $webapi.get($apis.getUrl($apis.tax.tbmanifesto, 
                                    [$scope.token, 5, /* $campos.tax.tbmanifesto.dtemissao */108, 0, 
                                     $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                    filtros)) 
                .then(function(dados){
                    // Guarda o último filtro utilizado
                    ultimoFiltroBusca = filtros;
                    //console.log(dados);
                    // Reseta total de manifestos
                    $scope.total.nfe = 0;
                    // Obtém os dados
                    $scope.manifestos = dados.Registros;

                    // Set valores de exibição
                    $scope.filtro.total_registros = dados.TotalDeRegistros;
                    $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                    if($scope.manifestos.length === 0) $scope.faixa_registros = '0-0';
                    else{
                        var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                        var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                        if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                        $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                    }
                    // Verifica se a página atual é maior que o total de páginas
                    if($scope.filtro.pagina > $scope.filtro.total_paginas)
                        setPagina(1); // volta para a primeira página e refaz a busca

                    // Fecha os progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyManifestoPos);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao obter manifestos (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyManifestoPos);
                  });           
       }
        else if( $scope.tabFiltro === 2 ) // Quando a busca for por chave de acesso, força o usuário digitar a Chave de Acesso
        {
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
                
                // Exibe o modal informando a obrigatoriedade da chave de acesso
                $scope.showModalAlerta('Por favor, digite a Chave de Acesso', 'Atos Capital', 'OK', function(){} );
        }
    }
                                                
                                                
                                                
    // TABELA EXPANSÍVEL
    $scope.toggle = function(manifesto){
        if(!manifesto || manifesto === null) return;
        if(manifesto.collapsed) manifesto.collapsed = false;
        else manifesto.collapsed = true;
    }
    $scope.isExpanded = function(manifesto){
        if(!manifesto || manifesto === null) return;
        return manifesto.collapsed;
    }
    
    
    
    
    // AÇÕES
    /** 
      * Download DANFE
      */
    $scope.downloadDANFE = function(manifesto, indexNota){
        var filtro = undefined;
        var colecao = 3; // default : todas
        var filename = manifesto.nrEmitenteCNPJCPF + '.zip';
        if(typeof indexNota === 'number'){
            // Apenas uma nota
            var nota = manifesto.notas[indexNota];
            //console.log("DOWNLOAD DANFE " + manifesto.nmEmitente.toUpperCase());
            //console.log(nota);
            colecao = 2;
            // filtro
            filtro = {id : /* $campos.tax.tbManifesto.idManifesto */ 100,
                      valor : nota.idManifesto};
            filename = nota.nrChave + '.pdf';
        }else{ 
            // Todas as notas  
            if(ultimoFiltroBusca){
                filtro = [];
                angular.copy(ultimoFiltroBusca, filtro);
                filtro.push({id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                             valor: manifesto.nrEmitenteCNPJCPF});
            }else
                filtro = {id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                          valor: manifesto.nrEmitenteCNPJCPF};
        }
        $scope.download($apis.getUrl($apis.util.utilnfe, [$scope.token, colecao, /*$campos.tax.tbmanifesto.dtEmissao*/ 108], filtro),
                 filename, true, divPortletBodyManifestoPos, divPortletBodyFiltrosPos);
    }
    /** 
      * Download XML
      */
    $scope.downloadXML = function(manifesto, indexNota){
        var filtro = undefined;
        var colecao = 1; // default : todas
        var filename = manifesto.nrEmitenteCNPJCPF + '.zip';
        if(typeof indexNota === 'number'){
            // Apenas uma nota
            var nota = manifesto.notas[indexNota];
            //console.log(nota);
            //console.log("DOWNLOAD XML " + manifesto.nmEmitente.toUpperCase());
            //console.log(nota);
            colecao = 0;
            // filtro
            filtro = {id : /* $campos.tax.tbManifesto.idManifesto */ 100,
                      valor : nota.idManifesto};
            filename = nota.nrChave + '.xml';
        }else{ 
            // Todas as notas  
            if(ultimoFiltroBusca){
                filtro = [];
                angular.copy(ultimoFiltroBusca, filtro);
                filtro.push({id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                             valor: manifesto.nrEmitenteCNPJCPF});
            }else
                filtro = {id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                          valor: manifesto.nrEmitenteCNPJCPF};
        }
        $scope.download($apis.getUrl($apis.util.utilnfe, [$scope.token, colecao, /*$campos.tax.tbmanifesto.dtEmissao*/ 108], filtro),
                 filename, true, divPortletBodyManifestoPos, divPortletBodyFiltrosPos);
    }
    
    
    
    
    
    
    // DETALHES
    /**
      * Obtém string com '<código> - <descricao/nome>'
      */
    $scope.getCodigoTracoDescricao = function(obj){
        var text = '';
        if(obj){
            if(typeof obj.codigo === 'number' || typeof obj.codigo === 'string'){ 
                text = obj.codigo + '';
                if(typeof obj.descricao === 'string') text += ' - ' + obj.descricao;
                else if(typeof obj.nome === 'string') text += ' - ' + obj.nome;
            }else if(typeof obj.descricao === 'string') text = obj.descricao;
            else if(typeof obj.nome === 'string') text = obj.nome;
        }
        return text;//.toUpperCase();
    }
    
    /**
      * Requisita informações detalhadas da nota fiscal eletrônica
      */
    var obtemDetalhesNota = function(idManifesto, nrChave, funcaoSucesso){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtro = {id : /*$campos.tax.tbmanifesto.idManifesto*/ 100,
                     valor : idManifesto};
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.tax.tbmanifesto, [$scope.token, 4], filtro)) 
            .then(function(dados){
                // Obtém os dados
                $scope.notadetalhada = undefined;
                //console.log(dados);
           
                if(dados.Registros.length > 0){ 
                    $scope.notadetalhada = dados.Registros[0].notas[0];
                    $scope.notadetalhada.nrChave = nrChave;
                }

                if(typeof funcaoSucesso === 'function') funcaoSucesso();
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter detalhes da NF-e (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
              });     
    }
    
        /**
      * Requisita almoxarifados para importação da nota fiscal
      */
    var obtemAlmoxarifados = function(nrCNPJ, funcaoSucesso){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtro = {id :200, valor : nrCNPJ};
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.rezende.pgsql.tbalmoxarifado, [$scope.token, 1,100,0], filtro)) 
            .then(function(dados){
                // Obtém os dados
                $scope.almoxarifados = undefined;
              
                if(dados.Registros.length > 0){ 
                    $scope.almoxarifados = dados.Registros;
                }

                if(typeof funcaoSucesso === 'function') funcaoSucesso();
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.showAlert('Serviço indisponível no momento. Por favor tente mais tarde', true, 'warning',true);//$scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter os almaxorifados para importação (' + failData.status + ')', true, 'danger',true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
              });     
    }
    
        // Data Entrada
    $scope.exibeCalendarioDataEntrada = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataEntrada = !$scope.abrirCalendarioDataEntrada;
      };
                                                
            /**
      * Requisita a natureza da operação para importação da nota fiscal
      */
    var obtemNatOperacoes = function(colecao,funcaoSucesso){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       $webapi.get($apis.getUrl($apis.rezende.pgsql.tbnaturezaoperacao, [$scope.token, colecao])) 
            .then(function(dados){
                // Obtém os dados
                $scope.natOperacoes = undefined;
                
           
                if(dados.Registros.length > 0){ 
                    $scope.natOperacoes = dados.Registros;
                    
                }

                if(typeof funcaoSucesso === 'function') funcaoSucesso();
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.showAlert('Serviço indisponível no momento. Por favor tente mais tarde', true, 'warning',true);//$scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter a natureza da operação para importação da NFe(' + failData.status + ')', true, 'danger',true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
              });     
    }
    
    /** 
      * Detalha a nota
      */
    $scope.detalhar = function(manifesto, indexNota){
        var nota = manifesto.notas[indexNota];
        //console.log("DETALHAR " + manifesto.nmEmitente.toUpperCase());
        //console.log(nota);
        if(!$scope.notadetalhada || $scope.notadetalhada.idManifesto !== nota.idManifesto)
            obtemDetalhesNota(nota.idManifesto, nota.nrChave, function(){$('#modalDetalhes').modal('show');});
        else
            $('#modalDetalhes').modal('show');
    }
    
    /** 
      * Obtem as informações para importar a nota
    */
    $scope.obterInformarcoesImportar = function(manifesto, indexNota){
        var nota = manifesto.notas[indexNota];
        var uf = manifesto.UF;
        var colecao = 1;
        if(uf != 'SE')
        {
            colecao = 2;
        }

        if(nota.dtEntrega !=null)
        {
            $scope.nrChave = nota.nrChave;
            $scope.dtEntrega = nota.dtEntrega;
            obtemAlmoxarifados(nota.nrCNPJ, function(){$('#modalImportar').modal('show');});
            obtemNatOperacoes(colecao,function(){$('#modalImportar').modal('show');});

        }
        else
        {

           $scope.showModalAlerta('A nota não está disponível para importação, pois a mesma ainda não foi recebida.'); 
           return;
        }
    }

    /*
    Importação da NFe
    */
    $scope.importarNota = function () {
        
        // Valida se o usuário informou os dados necessários 
        if(!$scope.dadosImportacao || $scope.dadosImportacao === null){
           $scope.showModalAlerta('É necessário selecionar a Natureza da Operação e o Almoxarifado!'); 
           return;       
       }else if(!$scope.dadosImportacao.natOperacao || $scope.dadosImportacao.natOperacao === null){
           $scope.showModalAlerta('É necessário selecionar a Natureza da Operação!'); 
           return;       
       }else if(!$scope.dadosImportacao.almoxarifado || $scope.dadosImportacao.almoxarifado === null){
           $scope.showModalAlerta('É necessário selecionar o Almoxarifado!'); 
           return;       
       }else if(!$scope.dtEntrega || $scope.dtEntrega === null){
            $scope.showModalAlerta('Favor informar a data de Entrada da Nota!'); 
           return; 
       }
        
        // Obtém o JSON
        var jsonImportar = { nrChave : $scope.nrChave,
                             codAlmoxarifado : $scope.dadosImportacao.almoxarifado.cod_almoxarifado,
                             //codNaturezaOperacao : $scope.dadosImportacao.natOperacao.cdNaturezaOperacao,
                             codNaturezaOperacao : $scope.dadosImportacao.natOperacao.cod_natureza_operacao,
                             dtEntrega: $scope.dtEntrega,
                           };

        // POST
        $scope.showProgress();
        $webapi.post($apis.getUrl($apis.rezende.pgsql.tabnotafiscalentrada, undefined,
                                 {id : 'token', valor : $scope.token}), jsonImportar) 
            .then(function(dados){
                // Fecha os progress
                $scope.hideProgress();
            
                    if(dados && dados != null){
                        if(dados.cdMensagem === 200)
                        {
                           //Fecha o modal
                           fechaModalImportar();
                            $scope.showModalAlerta('Nota Fiscal incluída com sequência: '+dados.sqNota+'.');   
                        }
                        else{
                        fechaModalImportar();
                        $scope.Mensagens = dados.Erro;
                        exibeRetornoImportacao();
                        }
                    }else{ 
                    // Não recebeu JSON de resposta...
                    // Fecha o modal
                        fechaModalImportar();
                    }
              },
            function(failData){
                fechaModalImportar();
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else if(failData.status === 503 || failData.status === 404) $scope.showAlert('Serviço indisponível no momento. Por favor tente mais tarde', true, 'warning',true);//$scope.voltarTelaLogin(); // Volta para a tela de login
                else $scope.showAlert('Houve uma falha ao importar a NFe (' + failData.status + ')', true, 'danger', true);
                // Fecha os progress
                $scope.hideProgress();
                
            }); 
        $scope.dadosImportacao = null;
    };
           
    /*
    Fecha o modal Importar
    */                                            
    var fechaModalImportar = function(){
        $('#modalImportar').modal('hide');       
    }
    
        var exibeRetornoImportacao = function(){
        $('#modalRetornoImportacao').modal('show');       
    }
    /** 
      * Imprime a nota
      */
    $scope.imprimir = function(manifesto, indexNota){
        var nota = manifesto.notas[indexNota];
        //console.log("IMPRIMIR " + manifesto.nmEmitente.toUpperCase());
        //console.log(nota);
        $window.open('views/impressao-nfe#?k=' + nota.nrChave + '&t='+$scope.token, '_blank');
        //obtemDetalhesNota(nota.idManifesto, function(){ /* abre nova aba */});
    }
        
        
    
    
    //TAB MODAL
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 8) $scope.tab = tab;        
    }
    
    
    //TAB FILTROS
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabFiltroIs = function (tabFiltro){
        return $scope.tabFiltro === tabFiltro;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTabFiltro = function (tabFiltro){
        if (tabFiltro >= 1 && tabFiltro <= 2) $scope.tabFiltro = tabFiltro;        
    }
      
    //Opção Importar
    
    $scope.exibeOpcaoImportar = function(){
    if($scope.usuariologado.grupoempresa && ($scope.usuariologado.grupoempresa.id_grupo === 6 || $scope.usuariologado.grupoempresa.id_grupo === 15))
        return true;
    else
        return false;   
    }
}])