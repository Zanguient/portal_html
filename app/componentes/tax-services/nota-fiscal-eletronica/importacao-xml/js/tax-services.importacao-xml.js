/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("tax-services-importacao-xml", []) 

.controller("tax-services-importacao-xmlCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.filiais = [];   
    $scope.emitentes = [];                                            
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.statusmanifesto = [/*{id: 1, nome : 'MANIFESTO'},
                                {id: 2, nome : 'ERP'}*/];                                        
    $scope.filtro = { datamin : new Date(), datamax : '',
                      statusmanifesto : null, destinatario : null, emitente : '',
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0}; 
                                                
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress                             
    // flags
    $scope.tab = 1;
    $scope.exibeTela = false;   
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                                            
                                                
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
            if($scope.usuariologado.grupoempresa) buscaFiliais();
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        
        $scope.emitentes.push({nrEmitenteCNPJCPF : '11111111',
                               nmEmitente : 'Emitente 1',
                               UF : 'SE',
                               notas : [{dtEmissao : '2015-08-20 00:00:00',
                                         modelo : 55,
                                         numero : 12345,
                                         serie : 1,
                                         vlNFe : 200.57,
                                         nrChave : 'Q123123asdasxcz0812',
                                         nfe : '2938471',
                                         dsSituacaoManifesto: 'Confirmado',
                                         dsSituacaoErp : 'Não Importado'}, 
                                        {dtEmissao : '2015-08-21 00:00:00',
                                         modelo : 66,
                                         numero : 6789,
                                         serie : 2,
                                         vlNFe : 399.01,
                                         nrChave : 'XXYYZZWW',
                                         nfe : '0092138',
                                         dsSituacaoManifesto: 'Ciente',
                                         dsSituacaoErp : 'Não Importado'}]});
        
        
        $scope.emitentes.push({nrEmitenteCNPJCPF : '222222',
                               nmEmitente : 'Emitente 2',
                               UF : 'BA',
                               notas : [{dtEmissao : '2015-08-20 00:00:00',
                                         modelo : 77,
                                         numero : 98765,
                                         serie : 4,
                                         vlNFe : 321.09,
                                         nrChave : 'POIYJKLMN',
                                         nfe : '090909',
                                         dsSituacaoManifesto: 'Desconhecido',
                                         dsSituacaoErp : 'Não Importado'}]});
    };                                           
                                                
                                            
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           //$scope.buscaPrivilegios(); 
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
        //$scope.buscaPrivilegios();   
    };
                                                
                                                
        
                                                
   /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.destinatario = $scope.filtro.statusmanifesto = null; 
        
        $scope.filtro.emitente = '';

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
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo}];
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
                                                
                                                
                                                
    // EMITENTE
    $scope.toggle = function(emitente){
        if(!emitente || emitente === null) return;
        if(emitente.collapsed) emitente.collapsed = false;
        else emitente.collapsed = true;
    }
    $scope.isExpanded = function(emitente){
        if(!emitente || emitente === null) return;
        return emitente.collapsed;
    }
    
    
    
    
    // AÇÕES
    $scope.downloadDAMFE = function(emitente, indexNota){
        var nota = emitente.notas[indexNota];
        console.log("DOWNLOAD DAMFE " + emitente.nmEmitente.toUpperCase());
        console.log(nota);
        
        // get => $apis.util.utilnfe (coleção 2) => coleção 3 vem um zip com todos os pdfs
        // {id : /* $campos.tax.tbManifesto.idManifesto */ 100, valor : nota.idManifesto}
        // Retorna o arquivo para fazer o download
    }
    $scope.detalhar = function(emitente, indexNota){
        var nota = emitente.notas[indexNota];
        console.log("DETALHAR " + emitente.nmEmitente.toUpperCase());
        console.log(nota);
        $('#modalDetalhes').modal('show');
    }
    $scope.imprimir = function(emitente, indexNota){
        var nota = emitente.notas[indexNota];
        console.log("IMPRIMIR " + emitente.nmEmitente.toUpperCase());
        console.log(nota);
    }
    $scope.downloadXML = function(emitente, indexNota){
        var nota = emitente.notas[indexNota];
        console.log("DOWNLOAD XML " + emitente.nmEmitente.toUpperCase());
        console.log(nota);
        
        // get => $apis.util.utilnfe (coleção 0) => coleção 1 vem um zip com todos os xmls
        // {id : /* $campos.tax.tbManifesto.idManifesto */ 100, valor : nota.idManifesto}
        // Retorna o arquivo para fazer o download
    }
    
    
    //TAB
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
       
    
}])